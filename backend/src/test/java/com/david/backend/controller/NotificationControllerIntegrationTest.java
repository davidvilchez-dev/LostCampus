package com.david.backend.controller;

import com.david.backend.model.Notificacion;
import com.david.backend.model.Usuario;
import com.david.backend.repository.*;
import com.david.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class NotificationControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private SolicitudReclamacionRepository claimRepository;

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private ImagenReporteRepository imagenReporteRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario testUser;
    private String jwtToken;
    private Notificacion testNotification;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        chatMessageRepository.deleteAllInBatch();
        chatRoomRepository.deleteAllInBatch();
        claimRepository.deleteAllInBatch();
        imagenReporteRepository.deleteAllInBatch();
        reporteRepository.deleteAllInBatch();
        notificacionRepository.deleteAllInBatch();
        usuarioRepository.deleteAllInBatch();
        categoriaRepository.deleteAllInBatch();

        testUser = Usuario.builder()
                .nombreCompleto("David Perez")
                .correo("david@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("password123"))
                .build();
        usuarioRepository.save(testUser);

        jwtToken = jwtTokenProvider.generateToken(testUser.getCorreo());

        testNotification = Notificacion.builder()
                .usuario(testUser)
                .titulo("Test Notif")
                .mensaje("Mensaje de prueba")
                .tipo("TEST")
                .leido(false)
                .enlace("/test-link")
                .build();
        notificacionRepository.save(testNotification);
    }

    @Test
    void getNotificaciones_Success() throws Exception {
        mockMvc.perform(get("/api/notificaciones")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("Test Notif"))
                .andExpect(jsonPath("$[0].mensaje").value("Mensaje de prueba"));
    }

    @Test
    void getUnreadCount_Success() throws Exception {
        mockMvc.perform(get("/api/notificaciones/unread-count")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(1));
    }

    @Test
    void markAsRead_Success() throws Exception {
        mockMvc.perform(patch("/api/notificaciones/" + testNotification.getId() + "/read")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leido").value(true));
    }

    @Test
    void markAllAsRead_Success() throws Exception {
        mockMvc.perform(patch("/api/notificaciones/read-all")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notificaciones/unread-count")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(0));
    }
}
