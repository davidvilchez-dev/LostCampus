package com.david.backend.controller;

import com.david.backend.model.Categoria;
import com.david.backend.model.EstadoReclamacion;
import com.david.backend.model.Reporte;
import com.david.backend.model.SolicitudReclamacion;
import com.david.backend.model.Usuario;
import com.david.backend.repository.CategoriaRepository;
import com.david.backend.repository.ImagenReporteRepository;
import com.david.backend.repository.ReporteRepository;
import com.david.backend.repository.SolicitudReclamacionRepository;
import com.david.backend.repository.UsuarioRepository;
import com.david.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class SolicitudReclamacionControllerIntegrationTest {

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
    private SolicitudReclamacionRepository claimRepository;

    @Autowired
    private ImagenReporteRepository imagenReporteRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario claimant;
    private Usuario finder;
    private Categoria testCategory;
    private Reporte testReport;
    private String claimantToken;
    private String finderToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        claimRepository.deleteAllInBatch();
        imagenReporteRepository.deleteAllInBatch();
        reporteRepository.deleteAllInBatch();
        usuarioRepository.deleteAllInBatch();
        categoriaRepository.deleteAllInBatch();

        // 1. Crear usuarios
        claimant = Usuario.builder()
                .nombreCompleto("David Reclamante")
                .correo("david.reclamante@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("securePassword123"))
                .build();
        usuarioRepository.save(claimant);

        finder = Usuario.builder()
                .nombreCompleto("Carlos Hallador")
                .correo("carlos.hallador@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("securePassword123"))
                .build();
        usuarioRepository.save(finder);

        // Generar tokens JWT
        claimantToken = jwtTokenProvider.generateToken(claimant.getCorreo());
        finderToken = jwtTokenProvider.generateToken(finder.getCorreo());

        // 2. Crear categoría
        testCategory = Categoria.builder()
                .nombre("Electrónica")
                .icono("laptop")
                .build();
        categoriaRepository.save(testCategory);

        // 3. Crear reporte de tipo ENCONTRADO
        testReport = Reporte.builder()
                .usuario(finder)
                .categoria(testCategory)
                .tipo("ENCONTRADO")
                .nombreObjeto("Laptop ThinkPad")
                .descripcion("Encontrada en biblioteca central")
                .lugar("Biblioteca Central")
                .fechaIncidente(LocalDate.now())
                .estado("ACTIVO")
                .build();
        reporteRepository.save(testReport);
    }

    @Test
    void enviarSolicitud_Success() throws Exception {
        String requestJson = String.format(
                "{\"reporte_id\": %d, \"mensaje_prueba\": \"Tiene una pegatina de linux en la tapa y mi carnet adentro.\"}",
                testReport.getId()
        );

        mockMvc.perform(post("/api/reclamaciones")
                        .header("Authorization", "Bearer " + claimantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.reclamante_nombre").value("David Reclamante"))
                .andExpect(jsonPath("$.reporte_nombre_objeto").value("Laptop ThinkPad"))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }

    @Test
    void enviarSolicitud_ValidationFailure_MessageTooShort() throws Exception {
        String requestJson = String.format(
                "{\"reporte_id\": %d, \"mensaje_prueba\": \"Corta\"}", // Menos de 10 caracteres
                testReport.getId()
        );

        mockMvc.perform(post("/api/reclamaciones")
                        .header("Authorization", "Bearer " + claimantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.mensajePrueba").exists());
    }

    @Test
    void listarEnviadas_Success() throws Exception {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .reporte(testReport)
                .reclamante(claimant)
                .mensajePrueba("Tiene una pegatina de linux en la tapa.")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();
        claimRepository.save(claim);

        mockMvc.perform(get("/api/reclamaciones/enviadas")
                        .header("Authorization", "Bearer " + claimantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].reclamante_nombre").value("David Reclamante"));
    }

    @Test
    void listarRecibidas_Success() throws Exception {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .reporte(testReport)
                .reclamante(claimant)
                .mensajePrueba("Tiene una pegatina de linux en la tapa.")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();
        claimRepository.save(claim);

        mockMvc.perform(get("/api/reclamaciones/recibidas")
                        .header("Authorization", "Bearer " + finderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].reclamante_nombre").value("David Reclamante"))
                .andExpect(jsonPath("$[0].reporte_autor_nombre").value("Carlos Hallador"));
    }

    @Test
    void gestionarSolicitud_Aceptar_Success() throws Exception {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .reporte(testReport)
                .reclamante(claimant)
                .mensajePrueba("Tiene una pegatina de linux en la tapa.")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();
        claimRepository.save(claim);

        mockMvc.perform(post("/api/reclamaciones/" + claim.getId() + "/aceptar")
                        .header("Authorization", "Bearer " + finderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACEPTADA"))
                .andExpect(jsonPath("$.reporte_estado").value("EN_PROCESO"));
    }

    @Test
    void gestionarSolicitud_Rechazar_Success() throws Exception {
        SolicitudReclamacion claim = SolicitudReclamacion.builder()
                .reporte(testReport)
                .reclamante(claimant)
                .mensajePrueba("Tiene una pegatina de linux en la tapa.")
                .estado(EstadoReclamacion.PENDIENTE)
                .build();
        claimRepository.save(claim);

        mockMvc.perform(post("/api/reclamaciones/" + claim.getId() + "/rechazar")
                        .header("Authorization", "Bearer " + finderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECHAZADA"))
                .andExpect(jsonPath("$.reporte_estado").value("ACTIVO"));
    }
}
