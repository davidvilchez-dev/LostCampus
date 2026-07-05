package com.david.backend.service;

import com.david.backend.dto.response.ReportResponse;
import com.david.backend.exception.ResourceNotFoundException;
import com.david.backend.model.*;
import com.david.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ReporteRepository reporteRepository;
    private final LogAuditoriaAdminRepository logAuditoriaAdminRepository;
    private final ReportService reportService;
    private final SolicitudReclamacionRepository claimRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final HistorialEstadoReporteRepository historialEstadoReporteRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public Page<ReportResponse> getAdminReports(
            String query,
            List<Long> categoriaIds,
            String tipo,
            String lugar,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            String estado,
            int page,
            int size,
            String sortDirection
    ) {
        String estadoFilter = (estado == null || estado.isBlank()) ? "ALL" : estado;
        return reportService.getReports(query, categoriaIds, tipo, lugar, startDate, endDate, estadoFilter, page, size, sortDirection);
    }

    @Transactional
    public ReportResponse cambiarEstadoReporte(Usuario admin, Long reporteId, String nuevoEstado) {
        Reporte reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado."));

        String estadoAnterior = reporte.getEstado();
        reportService.actualizarEstado(reporte, nuevoEstado);

        LogAuditoriaAdmin log = LogAuditoriaAdmin.builder()
                .admin(admin)
                .accion("CAMBIO_ESTADO")
                .reporteId(reporteId)
                .detalles("Cambio de estado de '" + estadoAnterior + "' a '" + nuevoEstado.toUpperCase() + "' para reporte: " + reporte.getNombreObjeto())
                .fechaAccion(LocalDateTime.now())
                .build();
        logAuditoriaAdminRepository.save(log);

        return ReportResponse.fromEntity(reporte);
    }

    @Transactional
    public void eliminarReporte(Usuario admin, Long reporteId, String motivo) {
        Reporte reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado."));

        // Auditoría antes de eliminar físicamente para conservar registro de los datos
        LogAuditoriaAdmin log = LogAuditoriaAdmin.builder()
                .admin(admin)
                .accion("ELIMINAR_REPORTE")
                .reporteId(reporteId)
                .detalles("Reporte eliminado: " + reporte.getNombreObjeto() + " (Usuario autor ID: " + reporte.getUsuario().getId() + "). Motivo: " + motivo)
                .fechaAccion(LocalDateTime.now())
                .build();
        logAuditoriaAdminRepository.save(log);

        // 1. Eliminar imágenes de Cloudinary
        for (ImagenReporte imagen : reporte.getImagenes()) {
            try {
                cloudinaryService.deleteImage(imagen.getPublicIdCloudinary());
            } catch (IOException e) {
                System.err.println("Error eliminando imagen de Cloudinary: " + e.getMessage());
            }
        }

        // 2. Eliminar mensajes de chat asociados a las salas de chat de este reporte
        List<ChatRoom> rooms = chatRoomRepository.findByReporteId(reporteId);
        for (ChatRoom room : rooms) {
            chatMessageRepository.deleteByChatRoomId(room.getId());
        }

        // 3. Eliminar salas de chat
        chatRoomRepository.deleteAllInBatch(rooms);

        // 4. Eliminar solicitudes de reclamación
        List<SolicitudReclamacion> claims = new ArrayList<>();
        claims.addAll(claimRepository.findByReporteIdAndEstado(reporteId, EstadoReclamacion.PENDIENTE));
        claims.addAll(claimRepository.findByReporteIdAndEstado(reporteId, EstadoReclamacion.ACEPTADA));
        claims.addAll(claimRepository.findByReporteIdAndEstado(reporteId, EstadoReclamacion.RECHAZADA));
        claimRepository.deleteAllInBatch(claims);

        // 5. Eliminar historial de estados
        List<HistorialEstadoReporte> historial = historialEstadoReporteRepository.findByReporteIdOrderByFechaCambioDesc(reporteId);
        historialEstadoReporteRepository.deleteAllInBatch(historial);

        // 6. Eliminar el reporte
        reporteRepository.delete(reporte);
    }

    @Transactional(readOnly = true)
    public List<LogAuditoriaAdmin> getAuditLogs() {
        return logAuditoriaAdminRepository.findAllByOrderByFechaAccionDesc();
    }
}
