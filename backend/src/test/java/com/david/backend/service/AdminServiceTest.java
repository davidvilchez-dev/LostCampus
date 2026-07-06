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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
                when(claimRepository.findByReporteIdAndEstado(eq(10L), any(EstadoReclamacion.class)))
                                .thenReturn(new ArrayList<>());
                when(historialEstadoReporteRepository.findByReporteIdOrderByFechaCambioDesc(10L))
                                .thenReturn(new ArrayList<>());

                adminService.eliminarReporte(adminUser, 10L, "Publicacion inapropiada");

                verify(reporteRepository).delete(testReport);
                verify(logAuditoriaAdminRepository).save(any(LogAuditoriaAdmin.class));
        }

        @Test
        void getAuditLogs_Success() {
                when(logAuditoriaAdminRepository.findAllByOrderByFechaAccionDesc())
                                .thenReturn(List.of(new LogAuditoriaAdmin()));

                List<LogAuditoriaAdmin> logs = adminService.getAuditLogs();

                assertNotNull(logs);
                assertEquals(1, logs.size());
                verify(logAuditoriaAdminRepository).findAllByOrderByFechaAccionDesc();
        }

        @Test
        void getAdminReports_Success() {
                org.springframework.data.domain.Page<com.david.backend.dto.response.ReportResponse> mockPage = new org.springframework.data.domain.PageImpl<>(
                                new ArrayList<>());
                when(reportService.getReports(
                                any(), any(), any(), any(), any(), any(), eq("ALL"), anyInt(), anyInt(), any()))
                                .thenReturn(mockPage);

                var result = adminService.getAdminReports(null, null, null, null, null, null, null, 0, 10, "desc");
                assertNotNull(result);
                verify(reportService).getReports(null, null, null, null, null, null, "ALL", 0, 10, "desc");
        }

        @Test
        void getAdminReports_WithEstado() {
                org.springframework.data.domain.Page<com.david.backend.dto.response.ReportResponse> mockPage = new org.springframework.data.domain.PageImpl<>(
                                new ArrayList<>());
                when(reportService.getReports(
                                any(), any(), any(), any(), any(), any(), eq("ACTIVO"), anyInt(), anyInt(), any()))
                                .thenReturn(mockPage);

                var result = adminService.getAdminReports(null, null, null, null, null, null, "ACTIVO", 0, 10, "desc");
                assertNotNull(result);
                verify(reportService).getReports(null, null, null, null, null, null, "ACTIVO", 0, 10, "desc");
        }

        @Test
        void eliminarReporte_WithImagesAndChats() throws java.io.IOException {
                ImagenReporte img = ImagenReporte.builder()
                                .id(1L)
                                .publicIdCloudinary("img_pub_id")
                                .urlCloudinary("url")
                                .build();
                testReport.getImagenes().add(img);

                ChatRoom room = ChatRoom.builder().id(100L).build();

                when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));
                when(chatRoomRepository.findByReporteId(10L)).thenReturn(List.of(room));
                when(claimRepository.findByReporteIdAndEstado(eq(10L), any(EstadoReclamacion.class)))
                                .thenReturn(new ArrayList<>());
                when(historialEstadoReporteRepository.findByReporteIdOrderByFechaCambioDesc(10L))
                                .thenReturn(new ArrayList<>());

                adminService.eliminarReporte(adminUser, 10L, "Contenido inapropiado");

                verify(cloudinaryService).deleteImage("img_pub_id");
                verify(chatMessageRepository).deleteByChatRoomId(100L);
                verify(chatRoomRepository).deleteAllInBatch(List.of(room));
                verify(reporteRepository).delete(testReport);
        }
}
