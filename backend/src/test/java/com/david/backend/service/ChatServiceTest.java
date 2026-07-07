package com.david.backend.service;

import com.david.backend.dto.request.SendChatMessageRequest;
import com.david.backend.dto.response.ChatMessageResponse;
import com.david.backend.dto.response.ChatRoomResponse;
import com.david.backend.exception.ResourceNotFoundException;
import com.david.backend.model.ChatMessage;
import com.david.backend.model.ChatRoom;
import com.david.backend.model.Reporte;
import com.david.backend.model.Usuario;
import com.david.backend.repository.ChatMessageRepository;
import com.david.backend.repository.ChatRoomRepository;
import com.david.backend.repository.ReporteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ReporteRepository reporteRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.david.backend.event.WebSocketSubscriptionListener subscriptionListener;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ChatService chatService;

    private Usuario userA;
    private Usuario userB;
    private Usuario userC;
    private Reporte reporte;
    private ChatRoom room;

    @BeforeEach
    void setUp() {
        userA = Usuario.builder()
                .id(1L)
                .nombreCompleto("Usuario A")
                .correo("usera@unsch.edu.pe")
                .fotoUrl("urlA")
                .build();

        userB = Usuario.builder()
                .id(2L)
                .nombreCompleto("Usuario B")
                .correo("userb@unsch.edu.pe")
                .fotoUrl("urlB")
                .build();

        userC = Usuario.builder()
                .id(3L)
                .nombreCompleto("Usuario C")
                .correo("userc@unsch.edu.pe")
                .fotoUrl("urlC")
                .build();

        reporte = Reporte.builder()
                .id(10L)
                .nombreObjeto("MacBook Pro")
                .usuario(userA)
                .tipo("ENCONTRADO")
                .estado("ACTIVO")
                .imagenes(new ArrayList<>())
                .build();

        room = ChatRoom.builder()
                .id(100L)
                .reporte(reporte)
                .creadorReporte(userA)
                .reclamante(userB)
                .activo(true)
                .createdAt(LocalDateTime.now())
                .build();

        lenient().doAnswer(invocation -> {
            Reporte r = invocation.getArgument(0);
            String status = invocation.getArgument(1);
            r.setEstado(status);
            return null;
        }).when(reportService).actualizarEstado(any(Reporte.class), anyString());
    }

    @Test
    void createChatRoom_New_Success() {
        when(chatRoomRepository.findByReporteIdAndReclamanteId(10L, 2L)).thenReturn(Optional.empty());
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(room);

        ChatRoom result = chatService.createChatRoom(reporte, userA, userB);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(chatRoomRepository, times(1)).save(any(ChatRoom.class));
    }

    @Test
    void createChatRoom_Existing_Success() {
        when(chatRoomRepository.findByReporteIdAndReclamanteId(10L, 2L)).thenReturn(Optional.of(room));

        ChatRoom result = chatService.createChatRoom(reporte, userA, userB);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(chatRoomRepository, never()).save(any(ChatRoom.class));
    }

    @Test
    void getRoomsForUser_Success() {
        ChatMessage lastMessage = ChatMessage.builder()
                .id(500L)
                .chatRoom(room)
                .remitente(userB)
                .contenido("Hola, es mío")
                .createdAt(LocalDateTime.now())
                .build();

        when(chatRoomRepository.findByCreadorReporteIdOrReclamanteIdOrderByCreatedAtDesc(1L, 1L))
                .thenReturn(Collections.singletonList(room));
        when(chatMessageRepository.findFirstByChatRoomIdOrderByCreatedAtDesc(100L))
                .thenReturn(Optional.of(lastMessage));

        List<ChatRoomResponse> result = chatService.getRoomsForUser(userA);

        assertFalse(result.isEmpty());
        ChatRoomResponse resp = result.get(0);
        assertEquals(100L, resp.getId());
        assertEquals("Usuario B", resp.getInterlocutorNombre());
        assertEquals("Hola, es mío", resp.getUltimoMensaje());
    }

    @Test
    void getRoomMessages_Success() {
        ChatMessage msg = ChatMessage.builder()
                .id(500L)
                .chatRoom(room)
                .remitente(userB)
                .contenido("Mensaje de prueba")
                .createdAt(LocalDateTime.now())
                .build();

        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(100L))
                .thenReturn(Collections.singletonList(msg));

        List<ChatMessageResponse> result = chatService.getRoomMessages(userA, 100L);

        assertEquals(1, result.size());
        assertEquals("Mensaje de prueba", result.get(0).getContenido());
    }

    @Test
    void getRoomMessages_AccessDenied() {
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));

        assertThrows(AccessDeniedException.class, () -> chatService.getRoomMessages(userC, 100L));
    }

    @Test
    void getRoomMessages_NotFound() {
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> chatService.getRoomMessages(userA, 100L));
    }

    @Test
    void sendMessage_Success() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola");

        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessageResponse result = chatService.sendMessage(userA, 100L, request);

        assertNotNull(result);
        assertEquals("Hola", result.getContenido());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chat/100"), any(ChatMessageResponse.class));
    }

    @Test
    void sendMessage_ClosedChat_ThrowsException() {
        room.setActivo(false);
        SendChatMessageRequest request = new SendChatMessageRequest("Hola");

        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));

        assertThrows(RuntimeException.class, () -> chatService.sendMessage(userA, 100L, request));
    }

    @Test
    void confirmDelivery_Success() {
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));

        ChatRoomResponse result = chatService.confirmDelivery(userA, 100L);

        assertNotNull(result);
        assertFalse(result.getActivo());
        assertEquals("RECUPERADO", result.getReporteEstado());
        verify(reportService, times(1)).actualizarEstado(reporte, "RECUPERADO");
        verify(chatRoomRepository, times(1)).save(room);
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chat/100/close"), any(ChatRoomResponse.class));
    }

    @Test
    void confirmDelivery_NotOwner_ThrowsException() {
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));

        assertThrows(RuntimeException.class, () -> chatService.confirmDelivery(userB, 100L));
    }

    @Test
    void getRoomsForUser_NoMessagesAndWithImages_Success() {
        com.david.backend.model.ImagenReporte img = com.david.backend.model.ImagenReporte.builder()
                .id(1L)
                .urlCloudinary("http://image.url")
                .build();
        reporte.getImagenes().add(img);

        when(chatRoomRepository.findByCreadorReporteIdOrReclamanteIdOrderByCreatedAtDesc(1L, 1L))
                .thenReturn(Collections.singletonList(room));
        when(chatMessageRepository.findFirstByChatRoomIdOrderByCreatedAtDesc(100L))
                .thenReturn(Optional.empty());

        List<ChatRoomResponse> result = chatService.getRoomsForUser(userA);

        assertFalse(result.isEmpty());
        assertEquals("http://image.url", result.get(0).getReporteImagenUrl());
        assertNull(result.get(0).getUltimoMensaje());
    }

    @Test
    void sendMessage_AsClaimantAndUserActive_Success() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola de vuelta");
        // Sender is claimant (userB)
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionListener.isUserActiveInChat(1L, 100L)).thenReturn(true); // Owner is active

        ChatMessageResponse result = chatService.sendMessage(userB, 100L, request);

        assertNotNull(result);
        assertEquals("Hola de vuelta", result.getContenido());
        verify(notificationService, never()).crearNotificacion(any(), any(), any(), any(), any());
    }

    @Test
    void confirmDelivery_AlreadyInactive_ThrowsException() {
        room.setActivo(false);
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));

        assertThrows(RuntimeException.class, () -> chatService.confirmDelivery(userA, 100L));
    }

    @Test
    void sendMessage_ClaimantActive_NoNotification() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola reclamante");
        // Sender is creator (userA)
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionListener.isUserActiveInChat(2L, 100L)).thenReturn(true); // Claimant (userB: ID 2) is active

        ChatMessageResponse result = chatService.sendMessage(userA, 100L, request);

        assertNotNull(result);
        assertEquals("Hola reclamante", result.getContenido());
        verify(notificationService, never()).crearNotificacion(any(), any(), any(), any(), any());
    }

    @Test
    void sendMessage_ClaimantInactive_SendsNotification() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola reclamante desconectado");
        // Sender is creator (userA)
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionListener.isUserActiveInChat(2L, 100L)).thenReturn(false); // Claimant (userB: ID 2) is inactive

        ChatMessageResponse result = chatService.sendMessage(userA, 100L, request);

        assertNotNull(result);
        assertEquals("Hola reclamante desconectado", result.getContenido());
        verify(notificationService, times(1)).crearNotificacion(
                eq(userB),
                eq("Nuevo mensaje de chat"),
                eq("Usuario A: Hola reclamante desconectado"),
                eq("CHAT_MENSAJE"),
                eq("/mensajes"));
    }

    @Test
    void sendMessage_CreatorActive_NoNotification() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola creador");
        // Sender is claimant (userB)
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionListener.isUserActiveInChat(1L, 100L)).thenReturn(true); // Creator (userA: ID 1) is active

        ChatMessageResponse result = chatService.sendMessage(userB, 100L, request);

        assertNotNull(result);
        assertEquals("Hola creador", result.getContenido());
        verify(notificationService, never()).crearNotificacion(any(), any(), any(), any(), any());
    }

    @Test
    void sendMessage_CreatorInactive_SendsNotification() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola creador desconectado");
        // Sender is claimant (userB)
        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionListener.isUserActiveInChat(1L, 100L)).thenReturn(false); // Creator (userA: ID 1) is inactive

        ChatMessageResponse result = chatService.sendMessage(userB, 100L, request);

        assertNotNull(result);
        assertEquals("Hola creador desconectado", result.getContenido());
        verify(notificationService, times(1)).crearNotificacion(
                eq(userA),
                eq("Nuevo mensaje de chat"),
                eq("Usuario B: Hola creador desconectado"),
                eq("CHAT_MENSAJE"),
                eq("/mensajes"));
    }
}
