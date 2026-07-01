package com.david.backend.controller;

import com.david.backend.model.Categoria;
import com.david.backend.model.Reporte;
import com.david.backend.model.Usuario;
import com.david.backend.repository.CategoriaRepository;
import com.david.backend.repository.ReporteRepository;
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

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class ReportControllerIntegrationTest {

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
    private com.david.backend.repository.ImagenReporteRepository imagenReporteRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario testUser;
    private Categoria testCategory;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        imagenReporteRepository.deleteAllInBatch();
        reporteRepository.deleteAllInBatch();
        usuarioRepository.deleteAllInBatch();
        categoriaRepository.deleteAllInBatch();

        testUser = Usuario.builder()
                .nombreCompleto("David Vilchez")
                .correo("david.vilchez@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("securePassword123"))
                .build();
        usuarioRepository.save(testUser);

        testCategory = Categoria.builder()
                .nombre("Electrónica")
                .icono("smartphone")
                .build();
        categoriaRepository.save(testCategory);

        jwtToken = jwtTokenProvider.generateToken(testUser.getCorreo());
    }

    @Test
    void createReport_Success() throws Exception {
        String json = "{"
                + "\"categoria_id\":" + testCategory.getId() + ","
                + "\"tipo\":\"PERDIDO\","
                + "\"nombre_objeto\":\"Llavero cuero\","
                + "\"descripcion\":\"Contiene 3 llaves\","
                + "\"lugar\":\"Biblioteca Central\","
                + "\"fecha_incidente\":\"" + LocalDate.now() + "\""
                + "}";

        mockMvc.perform(post("/api/reports")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nombre_objeto").value("Llavero cuero"))
                .andExpect(jsonPath("$.tipo").value("PERDIDO"))
                .andExpect(jsonPath("$.categoria_nombre").value("Electrónica"));
    }

    @Test
    void getReportsFeed_Public_Success() throws Exception {
        Reporte report = Reporte.builder()
                .usuario(testUser)
                .categoria(testCategory)
                .tipo("ENCONTRADO")
                .nombreObjeto("Mochila negra")
                .descripcion("Marca Adidas")
                .lugar("Comedor Universitario")
                .fechaIncidente(LocalDate.now())
                .build();
        reporteRepository.save(report);

        mockMvc.perform(get("/api/reports?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].nombre_objeto").value("Mochila negra"));
    }

    @Test
    void deleteReport_Success() throws Exception {
        Reporte report = Reporte.builder()
                .usuario(testUser)
                .categoria(testCategory)
                .tipo("PERDIDO")
                .nombreObjeto("Calculadora")
                .descripcion("Casio fx-991")
                .lugar("Laboratorio de Computo")
                .fechaIncidente(LocalDate.now())
                .build();
        reporteRepository.save(report);

        mockMvc.perform(delete("/api/reports/" + report.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Reporte eliminado correctamente."));
    }

    @Test
    void getReportsFeed_WithFilters_Success() throws Exception {
        Reporte report1 = Reporte.builder()
                .usuario(testUser)
                .categoria(testCategory)
                .tipo("ENCONTRADO")
                .nombreObjeto("Mochila negra")
                .descripcion("Marca Adidas")
                .lugar("Comedor Universitario")
                .fechaIncidente(LocalDate.now())
                .build();
        reporteRepository.save(report1);

        Reporte report2 = Reporte.builder()
                .usuario(testUser)
                .categoria(testCategory)
                .tipo("PERDIDO")
                .nombreObjeto("iPhone de prueba")
                .descripcion("iPhone 12")
                .lugar("Biblioteca")
                .fechaIncidente(LocalDate.now())
                .build();
        reporteRepository.save(report2);

        String url = String.format("/api/reports?categorias=%d&tipo=ENCONTRADO&lugar=Comedor&start_date=%s&end_date=%s",
                testCategory.getId(), LocalDate.now(), LocalDate.now());

        mockMvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].nombre_objeto").value("Mochila negra"));
    }

    @Test
    void getReportById_Success() throws Exception {
        Reporte report = Reporte.builder()
                .usuario(testUser)
                .categoria(testCategory)
                .tipo("ENCONTRADO")
                .nombreObjeto("Mochila azul")
                .descripcion("Marca Jansport")
                .lugar("Laboratorio")
                .fechaIncidente(LocalDate.now())
                .build();
        report = reporteRepository.save(report);

        mockMvc.perform(get("/api/reports/" + report.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(report.getId()))
                .andExpect(jsonPath("$.nombre_objeto").value("Mochila azul"))
                .andExpect(jsonPath("$.descripcion").value("Marca Jansport"));
    }

    @Test
    void getReportById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/reports/999999"))
                .andExpect(status().isNotFound());
    }
}
