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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SolicitudReclamacionServiceTest {

    @Mock
    private SolicitudReclamacionRepository claimRepository;

    @Mock
    private ReporteRepository reportRepository;

    @Mock
    private ChatService chatService;

    @InjectMocks
    private SolicitudReclamacionService claimService;

    private Usuario reclamante;
    private Usuario autor;
    private Reporte reporte;
    private CreateClaimRequest request;

    @BeforeEach
    void setUp() {
        reclamante = Usuario.builder()
                .id(1L)
                .nombreCompleto("Juan Reclamante")
                .correo("juan@unsch.edu.pe")
                .build();

        autor = Usuario.builder()
                .id(2L)
                .nombreCompleto("Pedro Encontrador")
                .correo("pedro@unsch.edu.pe")
                .build();

        com.david.backend.model.Categoria categoria = com.david.backend.model.Categoria.builder()
                .id(1L)
                .nombre("Mochilas")
                .build();

        reporte = Reporte.builder()
                .id(10L)
                .usuario(autor)
                .categoria(categoria)
                .tipo("ENCONTRADO")
                .nombreObjeto("Mochila negra")
                .descripcion("Encontre una mochila en el pabellón M")
                .lugar("Pabellón M")
                .fechaIncidente(LocalDate.now())
                .estado("ACTIVO")
                .imagenes(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        request = new CreateClaimRequest();
        request.setReporteId(10L);
        request.setMensajePrueba("Tiene mi carnet universitario adentro.");
    }

    @Test
    void enviarSolicitud_Success() {
        when(reportRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(claimRepository.existsByReporteIdAndReclamanteIdAndEstadoIn(any(), any(), any())).thenReturn(false);

        SolicitudReclamacion savedClaim = SolicitudReclamacion.builder()
                .id(100L)
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba(request.getMensajePrueba())
                .estado(EstadoReclamacion.PENDIENTE)
                .createdAt(LocalDateTime.now())
                .build();

        when(claimRepository.save(any(SolicitudReclamacion.class))).thenReturn(savedClaim);

        ClaimResponse response = claimService.enviarSolicitud(reclamante, request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Juan Reclamante", response.getReclamanteNombre());
        assertEquals("Pedro Encontrador", response.getReporteAutorNombre());
        assertEquals(EstadoReclamacion.PENDIENTE, response.getEstado());
        verify(claimRepository).save(any(SolicitudReclamacion.class));
    }

    @Test
    void enviarSolicitud_ReportNotFound_ThrowsResourceNotFoundException() {
        when(reportRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                claimService.enviarSolicitud(reclamante, request)
        );
        verify(claimRepository, never()).save(any());
    }

    @Test
    void enviarSolicitud_ReportNotFoundType_ThrowsRuntimeException() {
        reporte.setTipo("PERDIDO"); // Solo se pueden reclamar ENCONTRADO
        when(reportRepository.findById(10L)).thenReturn(Optional.of(reporte));

        Exception ex = assertThrows(RuntimeException.class, () ->
                claimService.enviarSolicitud(reclamante, request)
        );
        assertTrue(ex.getMessage().contains("Solo se pueden reclamar"));
    }

    @Test
    void enviarSolicitud_ReportNotActive_ThrowsRuntimeException() {
        reporte.setEstado("CERRADO");
        when(reportRepository.findById(10L)).thenReturn(Optional.of(reporte));

        Exception ex = assertThrows(RuntimeException.class, () ->
                claimService.enviarSolicitud(reclamante, request)
        );
        assertTrue(ex.getMessage().contains("ya no está activo"));
    }

    @Test
    void enviarSolicitud_ClaimerIsAuthor_ThrowsRuntimeException() {
        // Reclamante es el mismo autor
        when(reportRepository.findById(10L)).thenReturn(Optional.of(reporte));

        Exception ex = assertThrows(RuntimeException.class, () ->
                claimService.enviarSolicitud(autor, request)
        );
        assertTrue(ex.getMessage().contains("No puedes reclamar tu propia publicación"));
    }

    @Test
    void enviarSolicitud_DuplicateClaim_ThrowsRuntimeException() {
        when(reportRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(claimRepository.existsByReporteIdAndReclamanteIdAndEstadoIn(any(), any(), any())).thenReturn(true);

        Exception ex = assertThrows(RuntimeException.class, () ->
                claimService.enviarSolicitud(reclamante, request)
        );
        assertTrue(ex.getMessage().contains("Ya has enviado una solicitud"));
    }

    @Test
    void listarEnviadas_Success() {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .id(100L)
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba("Evidencia")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();

        when(claimRepository.findByReclamanteIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.singletonList(claim));

        List<ClaimResponse> result = claimService.listarEnviadas(reclamante);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void listarRecibidas_Success() {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .id(100L)
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba("Evidencia")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();

        when(claimRepository.findByReporteUsuarioIdOrderByCreatedAtDesc(2L)).thenReturn(Collections.singletonList(claim));

        List<ClaimResponse> result = claimService.listarRecibidas(autor);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void aceptarSolicitud_Success() {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .id(100L)
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba("Evidencia")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();

        SolicitudReclamacion otraClaim = SolicitudReclamacion.builder()
                .id(101L)
                .reporte(reporte)
                .reclamante(Usuario.builder().id(3L).build())
                .mensajePrueba("Otra evidencia")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();

        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));
        when(claimRepository.findByReporteIdAndEstado(10L, EstadoReclamacion.PENDIENTE))
                .thenReturn(Collections.singletonList(otraClaim));

        ClaimResponse response = claimService.aceptarSolicitud(autor, 100L);

        assertEquals(EstadoReclamacion.ACEPTADA, response.getEstado());
        assertEquals("EN_PROCESO", reporte.getEstado());
        assertEquals(EstadoReclamacion.RECHAZADA, otraClaim.getEstado());

        verify(claimRepository).save(claim);
        verify(claimRepository).save(otraClaim);
        verify(reportRepository).save(reporte);
        verify(chatService).createChatRoom(reporte, autor, reclamante);
    }

    @Test
    void aceptarSolicitud_NotAuthor_ThrowsRuntimeException() {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .id(100L)
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba("Evidencia")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();

        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));

        assertThrows(RuntimeException.class, () ->
                claimService.aceptarSolicitud(reclamante, 100L) // Reclamante intenta aceptar
        );
    }

    @Test
    void rechazarSolicitud_Success() {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .id(100L)
                .reporte(reporte)
                .reclamante(reclamante)
                .mensajePrueba("Evidencia")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();

        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(SolicitudReclamacion.class))).thenReturn(claim);

        ClaimResponse response = claimService.rechazarSolicitud(autor, 100L);

        assertEquals(EstadoReclamacion.RECHAZADA, response.getEstado());
        verify(claimRepository).save(claim);
    }
}
