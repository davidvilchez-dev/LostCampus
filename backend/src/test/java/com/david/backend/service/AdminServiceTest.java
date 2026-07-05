package com.david.backend.service;

import com.david.backend.dto.response.ReportResponse;
import com.david.backend.model.*;
import com.david.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private ReporteRepository reporteRepository;

    @Mock
    private LogAuditoriaAdminRepository logAuditoriaAdminRepository;

    @Mock
    private ReportService reportService;

    @Mock
    private SolicitudReclamacionRepository claimRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private HistorialEstadoReporteRepository historialEstadoReporteRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AdminService adminService;

    private Usuario adminUser;
    private Usuario regularUser;
    private Reporte testReport;

    @BeforeEach
    void setUp() {
        adminUser = Usuario.builder()
                .id(1L)
                .nombreCompleto("Admin User")
                .esAdmin(true)
                .build();

        regularUser = Usuario.builder()
                .id(2L)
                .nombreCompleto("Regular User")
                .esAdmin(false)
                .build();

        Categoria category = Categoria.builder().id(1L).nombre("Electrónicos").build();
        testReport = Reporte.builder()
                .id(10L)
                .nombreObjeto("Laptop HP")
                .usuario(regularUser)
                .categoria(category)
                .estado("ACTIVO")
                .imagenes(new ArrayList<>())
                .build();
    }

    @Test
    void cambiarEstadoReporte_Success() {
        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));

        ReportResponse response = adminService.cambiarEstadoReporte(adminUser, 10L, "CERRADO");

        assertNotNull(response);
        verify(reportService).actualizarEstado(testReport, "CERRADO");
        verify(logAuditoriaAdminRepository).save(any(LogAuditoriaAdmin.class));
    }

    @Test
    void eliminarReporte_Success() {
        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));
        when(chatRoomRepository.findByReporteId(10L)).thenReturn(new ArrayList<>());
        when(claimRepository.findByReporteIdAndEstado(eq(10L), any(EstadoReclamacion.class))).thenReturn(new ArrayList<>());
        when(historialEstadoReporteRepository.findByReporteIdOrderByFechaCambioDesc(10L)).thenReturn(new ArrayList<>());

        adminService.eliminarReporte(adminUser, 10L, "Publicacion inapropiada");

        verify(reporteRepository).delete(testReport);
        verify(logAuditoriaAdminRepository).save(any(LogAuditoriaAdmin.class));
    }

    @Test
    void getAuditLogs_Success() {
        when(logAuditoriaAdminRepository.findAllByOrderByFechaAccionDesc()).thenReturn(List.of(new LogAuditoriaAdmin()));

        List<LogAuditoriaAdmin> logs = adminService.getAuditLogs();

        assertNotNull(logs);
        assertEquals(1, logs.size());
        verify(logAuditoriaAdminRepository).findAllByOrderByFechaAccionDesc();
    }
}
