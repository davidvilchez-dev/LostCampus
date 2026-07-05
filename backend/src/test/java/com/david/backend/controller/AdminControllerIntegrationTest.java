package com.david.backend.controller;

import com.david.backend.model.Usuario;
import com.david.backend.model.Categoria;
import com.david.backend.model.Reporte;
import com.david.backend.repository.*;
import com.david.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class AdminControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private ImagenReporteRepository imagenReporteRepository;

    @Autowired
    private SolicitudReclamacionRepository solicitudReclamacionRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private HistorialEstadoReporteRepository historialEstadoReporteRepository;

    @Autowired
    private LogAuditoriaAdminRepository logAuditoriaAdminRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario adminUser;
    private Usuario regularUser;
    private Categoria category;
    private Reporte report;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        logAuditoriaAdminRepository.deleteAllInBatch();
        historialEstadoReporteRepository.deleteAllInBatch();
        chatMessageRepository.deleteAllInBatch();
        chatRoomRepository.deleteAllInBatch();
        solicitudReclamacionRepository.deleteAllInBatch();
        imagenReporteRepository.deleteAllInBatch();
        reporteRepository.deleteAllInBatch();
        notificacionRepository.deleteAllInBatch();
        usuarioRepository.deleteAllInBatch();
        categoriaRepository.deleteAllInBatch();

        // Crear categorías
        category = Categoria.builder()
                .nombre("Electrónicos")
                .icono("laptop")
                .build();
        categoriaRepository.save(category);

        // Crear usuarios
        adminUser = Usuario.builder()
                .nombreCompleto("Admin Principal")
                .correo("admin@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("adminSecurePass"))
                .esAdmin(true)
                .build();
        usuarioRepository.save(adminUser);

        regularUser = Usuario.builder()
                .nombreCompleto("Usuario Comun")
                .correo("user@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("userSecurePass"))
                .esAdmin(false)
                .build();
        usuarioRepository.save(regularUser);

        // Generar JWT
        adminToken = jwtTokenProvider.generateToken(adminUser.getCorreo());
        userToken = jwtTokenProvider.generateToken(regularUser.getCorreo());

        // Crear reporte de prueba
        report = Reporte.builder()
                .usuario(regularUser)
                .categoria(category)
                .tipo("PERDIDO")
                .nombreObjeto("Celular Samsung")
                .descripcion("Celular Galaxy S21 negro")
                .lugar("Laboratorio de Computación")
                .fechaIncidente(LocalDate.now())
                .estado("ACTIVO")
                .build();
        reporteRepository.save(report);
    }

    @Test
    void getReports_Admin_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reportes")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nombre_objeto").value("Celular Samsung"));
    }

    @Test
    void getReports_RegularUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/reportes")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void cambiarEstadoReporte_Admin_Success() throws Exception {
        mockMvc.perform(put("/api/admin/reportes/" + report.getId() + "/estado")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estado\": \"CERRADO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CERRADO"));
    }

    @Test
    void eliminarReporte_Admin_Success() throws Exception {
        mockMvc.perform(delete("/api/admin/reportes/" + report.getId())
                .header("Authorization", "Bearer " + adminToken)
                .param("motivo", "Publicación engañosa"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getAuditLogs_Admin_Success() throws Exception {
        // Generar logs ejecutando una acción
        mockMvc.perform(put("/api/admin/reportes/" + report.getId() + "/estado")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estado\": \"CERRADO\"}"));

        mockMvc.perform(get("/api/admin/auditoria")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].accion").value("CAMBIO_ESTADO"));
    }
}
