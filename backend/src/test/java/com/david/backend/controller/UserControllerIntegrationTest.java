package com.david.backend.controller;

import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class UserControllerIntegrationTest {

        @Autowired
        private WebApplicationContext webApplicationContext;

        private MockMvc mockMvc;

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private com.david.backend.repository.ReporteRepository reporteRepository;

        @Autowired
        private com.david.backend.repository.ImagenReporteRepository imagenReporteRepository;

        @Autowired
        private com.david.backend.repository.SolicitudReclamacionRepository solicitudReclamacionRepository;

        @Autowired
        private com.david.backend.repository.ChatRoomRepository chatRoomRepository;

        @Autowired
        private com.david.backend.repository.ChatMessageRepository chatMessageRepository;

        @Autowired
        private com.david.backend.repository.NotificacionRepository notificacionRepository;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @org.springframework.test.context.bean.override.mockito.MockitoBean
        private com.david.backend.service.CloudinaryService cloudinaryService;

        private Usuario testUser;
        private String jwtToken;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                                .apply(SecurityMockMvcConfigurers.springSecurity())
                                .build();
                chatMessageRepository.deleteAllInBatch();
                chatRoomRepository.deleteAllInBatch();
                solicitudReclamacionRepository.deleteAllInBatch();
                imagenReporteRepository.deleteAllInBatch();
                reporteRepository.deleteAllInBatch();
                notificacionRepository.deleteAllInBatch();
                usuarioRepository.deleteAllInBatch();

                testUser = Usuario.builder()
                                .nombreCompleto("David Vilchez")
                                .correo("david.vilchez@unsch.edu.pe")
                                .contrasenaHash(passwordEncoder.encode("securePassword123"))
                                .build();
                usuarioRepository.save(testUser);

                jwtToken = jwtTokenProvider.generateToken(testUser.getCorreo());
        }

        @Test
        void getProfile_Authenticated_Success() throws Exception {
                mockMvc.perform(get("/api/users/me")
                                .header("Authorization", "Bearer " + jwtToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.nombre_completo").value("David Vilchez"))
                                .andExpect(jsonPath("$.correo").value("david.vilchez@unsch.edu.pe"));
        }

        @Test
        void getProfile_Unauthenticated_ReturnsUnauthorized() throws Exception {
                mockMvc.perform(get("/api/users/me"))
                                .andExpect(status().isForbidden()); // Spring Security default for unauthorized access
        }

        @Test
        void updateProfile_Success() throws Exception {
                String json = "{"
                                + "\"nombre_completo\":\"David Vilchez Updated\","
                                + "\"foto_url\":\"http://example.com/new-avatar.jpg\""
                                + "}";

                mockMvc.perform(put("/api/users/me")
                                .header("Authorization", "Bearer " + jwtToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.nombre_completo").value("David Vilchez Updated"))
                                .andExpect(jsonPath("$.foto_url").value("http://example.com/new-avatar.jpg"));
        }

        @Test
        void changePassword_Success() throws Exception {
                String json = "{"
                                + "\"contrasenaActual\":\"securePassword123\","
                                + "\"nuevaContrasena\":\"newSecurePassword123\""
                                + "}";

                mockMvc.perform(put("/api/users/me/password")
                                .header("Authorization", "Bearer " + jwtToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.mensaje").value("Contraseña actualizada correctamente."));
        }

        @Test
        void changePassword_MissingFields_ReturnsBadRequest() throws Exception {
                String json = "{"
                                + "\"contrasenaActual\":\"securePassword123\""
                                + "}";

                mockMvc.perform(put("/api/users/me/password")
                                .header("Authorization", "Bearer " + jwtToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").value("Se requieren la contraseña actual y la nueva."));
        }

        @Test
        void uploadAvatar_Success() throws Exception {
                java.util.Map<String, Object> mockResponse = new java.util.HashMap<>();
                mockResponse.put("secure_url", "http://mock.url/avatar.png");
                mockResponse.put("public_id", "avatar-123");

                org.mockito.Mockito.when(cloudinaryService.uploadImage(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(mockResponse);

                org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                                "file", "avatar.png", "image/png", "avatar-bytes".getBytes());

                mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/users/me/avatar")
                                .file(file)
                                .header("Authorization", "Bearer " + jwtToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.foto_url").value("http://mock.url/avatar.png"));
        }
}
