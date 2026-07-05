package com.david.backend.controller;

import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class AuthControllerIntegrationTest {

        @Autowired
        private WebApplicationContext webApplicationContext;

        private MockMvc mockMvc;

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private com.david.backend.repository.ReporteRepository reporteRepository;

        @Autowired
        private com.david.backend.repository.SolicitudReclamacionRepository solicitudReclamacionRepository;

        @Autowired
        private com.david.backend.repository.ImagenReporteRepository imagenReporteRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                                .apply(SecurityMockMvcConfigurers.springSecurity())
                                .build();
                solicitudReclamacionRepository.deleteAllInBatch();
                imagenReporteRepository.deleteAllInBatch();
                reporteRepository.deleteAllInBatch();
                usuarioRepository.deleteAllInBatch();
        }

        @Test
        void register_Success() throws Exception {
                String json = "{"
                                + "\"nombre_completo\":\"Juan Lopez\","
                                + "\"correo\":\"juan.lopez@unsch.edu.pe\","
                                + "\"contrasena\":\"securePassword123\""
                                + "}";

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.token", notNullValue()))
                                .andExpect(jsonPath("$.usuario.nombre_completo").value("Juan Lopez"))
                                .andExpect(jsonPath("$.usuario.correo").value("juan.lopez@unsch.edu.pe"));
        }

        @Test
        void register_DuplicateEmail_ReturnsError() throws Exception {
                Usuario existingUser = Usuario.builder()
                                .nombreCompleto("Juan Lopez")
                                .correo("juan.lopez@unsch.edu.pe")
                                .contrasenaHash(passwordEncoder.encode("securePassword123"))
                                .build();
                usuarioRepository.save(existingUser);

                String json = "{"
                                + "\"nombre_completo\":\"Juan Lopez Duplicate\","
                                + "\"correo\":\"juan.lopez@unsch.edu.pe\","
                                + "\"contrasena\":\"securePassword123\""
                                + "}";

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error", containsString("El correo ya está registrado")));
        }

        @Test
        void login_Success() throws Exception {
                Usuario user = Usuario.builder()
                                .nombreCompleto("Maria Gomez")
                                .correo("maria.gomez@unsch.edu.pe")
                                .contrasenaHash(passwordEncoder.encode("password123"))
                                .build();
                usuarioRepository.save(user);

                String json = "{"
                                + "\"correo\":\"maria.gomez@unsch.edu.pe\","
                                + "\"contrasena\":\"password123\""
                                + "}";

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token", notNullValue()))
                                .andExpect(jsonPath("$.usuario.correo").value("maria.gomez@unsch.edu.pe"));
        }

        @Test
        void login_InvalidCredentials_ReturnsError() throws Exception {
                String json = "{"
                                + "\"correo\":\"nonexistent@unsch.edu.pe\","
                                + "\"contrasena\":\"somepassword\""
                                + "}";

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error", containsString("Credenciales incorrectas")));
        }
}
