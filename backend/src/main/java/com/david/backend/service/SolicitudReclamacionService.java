package com.david.backend.service;

import com.david.backend.dto.request.CreateClaimRequest;
import com.david.backend.dto.response.ClaimResponse;
import com.david.backend.exception.ResourceNotFoundException;
import com.david.backend.model.EstadoReclamacion;
import com.david.backend.model.Reporte;
import com.david.backend.model.SolicitudReclamacion;
import com.david.backend.model.Usuario;
import com.david.backend.repository.ReporteRepository;
import com.david.backend.repository.SolicitudReclamacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudReclamacionService {

    private final SolicitudReclamacionRepository claimRepository;
    private final ReporteRepository reportRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;

    @Transactional
    public ClaimResponse enviarSolicitud(Usuario reclamante, CreateClaimRequest request) {
        Reporte reporte = reportRepository.findById(request.getReporteId())
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado con ID: " + request.getReporteId()));

        // Validar que el reporte sea del tipo ENCONTRADO
        if (!"ENCONTRADO".equals(reporte.getTipo())) {
            throw new RuntimeException("Solo se pueden reclamar objetos reportados como ENCONTRADO.");
        }

        // Validar que el reporte esté activo
        if (!"ACTIVO".equals(reporte.getEstado())) {
            throw new RuntimeException("El reporte seleccionado ya no está activo.");
        }

        // Validar que el reclamante no sea el autor del reporte
        if (reporte.getUsuario().getId().equals(reclamante.getId())) {
            throw new RuntimeException("No puedes reclamar tu propia publicación.");
        }

        // Validar que el reclamante no tenga ya una solicitud pendiente o aceptada para este reporte
        boolean yaExisteReclamacionActiva = claimRepository.existsByReporteIdAndReclamanteIdAndEstadoIn(
                reporte.getId(),
                reclamante.getId(),
                Arrays.asList(EstadoReclamacion.PENDIENTE, EstadoReclamacion.ACEPTADA)
        );
        if (yaExisteReclamacionActiva) {
            throw new RuntimeException("Ya has enviado una solicitud de reclamación para este objeto.");
        }

        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba(request.getMensajePrueba())
                .estado(EstadoReclamacion.ACEPTADA)
                .build();

        SolicitudReclamacion savedClaim = claimRepository.save(claim);

        // Cambiar el estado del reporte asociado a EN_PROCESO
        reporte.setEstado("EN_PROCESO");
        reportRepository.save(reporte);

        // Crear la sala de chat privada automáticamente
        chatService.createChatRoom(reporte, reporte.getUsuario(), reclamante);

        // Notificar al dueño de la publicación
        notificationService.crearNotificacion(
                reporte.getUsuario(),
                "Nuevo reclamo de objeto",
                reclamante.getNombreCompleto() + " ha iniciado una conversación para reclamar tu reporte '" + reporte.getNombreObjeto() + "'.",
                "RECLAMO_RECIBIDO",
                "/mensajes"
        );

        return ClaimResponse.fromEntity(savedClaim);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> listarEnviadas(Usuario reclamante) {
        return claimRepository.findByReclamanteIdOrderByCreatedAtDesc(reclamante.getId())
                .stream()
                .map(ClaimResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> listarRecibidas(Usuario creadorReporte) {
        return claimRepository.findByReporteUsuarioIdOrderByCreatedAtDesc(creadorReporte.getId())
                .stream()
                .map(ClaimResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ClaimResponse aceptarSolicitud(Usuario creadorReporte, Long claimId) {
        SolicitudReclamacion claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de reclamación no encontrada con ID: " + claimId));

        // Validar que el usuario que acepta sea el autor del reporte asociado
        if (!claim.getReporte().getUsuario().getId().equals(creadorReporte.getId())) {
            throw new RuntimeException("No tienes permisos para gestionar las solicitudes de este reporte.");
        }

        // Validar que la solicitud esté PENDIENTE
        if (claim.getEstado() != EstadoReclamacion.PENDIENTE) {
            throw new RuntimeException("Solo se pueden aceptar solicitudes pendientes.");
        }

        // Aceptar la solicitud
        claim.setEstado(EstadoReclamacion.ACEPTADA);
        claimRepository.save(claim);

        // Cambiar el estado del reporte asociado a EN_PROCESO
        Reporte reporte = claim.getReporte();
        reporte.setEstado("EN_PROCESO");
        reportRepository.save(reporte);

        // Crear la sala de chat privada automáticamente
        chatService.createChatRoom(reporte, creadorReporte, claim.getReclamante());

        // Notificar al reclamante
        notificationService.crearNotificacion(
                claim.getReclamante(),
                "Solicitud de reclamación aceptada",
                "Tu solicitud para reclamar '" + reporte.getNombreObjeto() + "' ha sido aceptada. Se ha abierto un chat para coordinar la entrega.",
                "RECLAMO_ACEPTADO",
                "/solicitudes"
        );

        // Rechazar automáticamente el resto de reclamaciones pendientes de este reporte
        List<SolicitudReclamacion> otrasPendientes = claimRepository.findByReporteIdAndEstado(reporte.getId(), EstadoReclamacion.PENDIENTE);
        for (SolicitudReclamacion otra : otrasPendientes) {
            otra.setEstado(EstadoReclamacion.RECHAZADA);
            claimRepository.save(otra);

            notificationService.crearNotificacion(
                    otra.getReclamante(),
                    "Solicitud de reclamación rechazada",
                    "Tu solicitud para reclamar '" + reporte.getNombreObjeto() + "' ha sido rechazada.",
                    "RECLAMO_RECHAZADO",
                    "/solicitudes"
            );
        }

        return ClaimResponse.fromEntity(claim);
    }

    @Transactional
    public ClaimResponse rechazarSolicitud(Usuario creadorReporte, Long claimId) {
        SolicitudReclamacion claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de reclamación no encontrada con ID: " + claimId));

        // Validar que el usuario que rechaza sea el autor del reporte asociado
        if (!claim.getReporte().getUsuario().getId().equals(creadorReporte.getId())) {
            throw new RuntimeException("No tienes permisos para gestionar las solicitudes de este reporte.");
        }

        // Validar que la solicitud esté PENDIENTE
        if (claim.getEstado() != EstadoReclamacion.PENDIENTE) {
            throw new RuntimeException("Solo se pueden rechazar solicitudes pendientes.");
        }

        // Rechazar la solicitud
        claim.setEstado(EstadoReclamacion.RECHAZADA);
        SolicitudReclamacion savedClaim = claimRepository.save(claim);

        // Notificar al reclamante
        notificationService.crearNotificacion(
                claim.getReclamante(),
                "Solicitud de reclamación rechazada",
                "Tu solicitud para reclamar '" + claim.getReporte().getNombreObjeto() + "' ha sido rechazada.",
                "RECLAMO_RECHAZADO",
                "/solicitudes"
        );

        return ClaimResponse.fromEntity(savedClaim);
    }
}
