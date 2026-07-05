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
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private PasswordEncoder passwordEncoder;

        private Usuario testUser;
        private String jwtToken;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                                .apply(SecurityMockMvcConfigurers.springSecurity())
                                .build();
                solicitudReclamacionRepository.deleteAllInBatch();
                imagenReporteRepository.deleteAllInBatch();
                reporteRepository.deleteAllInBatch();
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
}
