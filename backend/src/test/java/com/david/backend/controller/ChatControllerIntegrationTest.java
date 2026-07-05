package com.david.backend.controller;

import com.david.backend.model.*;
import com.david.backend.repository.*;
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
import java.util.ArrayList;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class ChatControllerIntegrationTest {

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
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario userA;
    private Usuario userB;
    private Usuario userC;
    private Categoria category;
    private Reporte report;
    private ChatRoom chatRoom;
    private String tokenA;
    private String tokenB;
    private String tokenC;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        claimRepository.deleteAllInBatch();
        imagenReporteRepository.deleteAllInBatch();
        chatMessageRepository.deleteAllInBatch();
        chatRoomRepository.deleteAllInBatch();
        reporteRepository.deleteAllInBatch();
        usuarioRepository.deleteAllInBatch();
        categoriaRepository.deleteAllInBatch();

        // 1. Crear usuarios
        userA = Usuario.builder()
                .nombreCompleto("Usuario A")
                .correo("usera@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("admin123"))
                .build();
        usuarioRepository.save(userA);

        userB = Usuario.builder()
                .nombreCompleto("Usuario B")
                .correo("userb@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("admin123"))
                .build();
        usuarioRepository.save(userB);

        userC = Usuario.builder()
                .nombreCompleto("Usuario C")
                .correo("userc@unsch.edu.pe")
                .contrasenaHash(passwordEncoder.encode("admin123"))
                .build();
        usuarioRepository.save(userC);

        // Generar Tokens
        tokenA = "Bearer " + jwtTokenProvider.generateToken(userA.getCorreo());
        tokenB = "Bearer " + jwtTokenProvider.generateToken(userB.getCorreo());
        tokenC = "Bearer " + jwtTokenProvider.generateToken(userC.getCorreo());

        // 2. Crear Categoria y Reporte
        category = Categoria.builder()
                .nombre("Tecnología")
                .icono("laptop")
                .build();
        categoriaRepository.save(category);

        report = Reporte.builder()
                .nombreObjeto("Laptop HP")
                .descripcion("Laptop de color negro")
                .lugar("Pabellón M")
                .fechaIncidente(LocalDate.now())
                .tipo("ENCONTRADO")
                .usuario(userA)
                .categoria(category)
                .estado("EN_PROCESO")
                .build();
        reporteRepository.save(report);

        // 3. Crear ChatRoom
        chatRoom = ChatRoom.builder()
                .reporte(report)
                .creadorReporte(userA)
                .reclamante(userB)
                .activo(true)
                .build();
        chatRoomRepository.save(chatRoom);
    }

    @Test
    void getRoomsForUser_Success() throws Exception {
        mockMvc.perform(get("/api/chats")
                        .header("Authorization", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].reporte_nombre_objeto").value("Laptop HP"))
                .andExpect(jsonPath("$[0].interlocutor_nombre").value("Usuario B"));
    }

    @Test
    void getRoomsForUser_Unauthenticated_Throws403() throws Exception {
        mockMvc.perform(get("/api/chats"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getRoomMessages_Success() throws Exception {
        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .remitente(userB)
                .contenido("Hola, ¿cuándo puedo recogerlo?")
                .build();
        chatMessageRepository.save(message);

        mockMvc.perform(get("/api/chats/" + chatRoom.getId() + "/mensajes")
                        .header("Authorization", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].contenido").value("Hola, ¿cuándo puedo recogerlo?"));
    }

    @Test
    void getRoomMessages_UnauthorizedUser_Throws403() throws Exception {
        mockMvc.perform(get("/api/chats/" + chatRoom.getId() + "/mensajes")
                        .header("Authorization", tokenC))
                .andExpect(status().isForbidden());
    }

    @Test
    void confirmDelivery_Success() throws Exception {
        mockMvc.perform(post("/api/chats/" + chatRoom.getId() + "/confirmar")
                        .header("Authorization", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false))
                .andExpect(jsonPath("$.reporte_estado").value("RECUPERADO"));
    }

    @Test
    void confirmDelivery_NotOwner_ThrowsException() throws Exception {
        mockMvc.perform(post("/api/chats/" + chatRoom.getId() + "/confirmar")
                        .header("Authorization", tokenB))
                .andExpect(status().isBadRequest());
    }
}
