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
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ReporteRepository reporteRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final com.david.backend.event.WebSocketSubscriptionListener subscriptionListener;

    @Transactional
    public ChatRoom createChatRoom(Reporte reporte, Usuario creador, Usuario reclamante) {
        return chatRoomRepository.findByReporteIdAndReclamanteId(reporte.getId(), reclamante.getId())
                .orElseGet(() -> {
                    ChatRoom room = ChatRoom.builder()
                            .reporte(reporte)
                            .creadorReporte(creador)
                            .reclamante(reclamante)
                            .activo(true)
                            .build();
                    return chatRoomRepository.save(room);
                });
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getRoomsForUser(Usuario usuario) {
        List<ChatRoom> rooms = chatRoomRepository.findByCreadorReporteIdOrReclamanteIdOrderByCreatedAtDesc(usuario.getId(), usuario.getId());
        return rooms.stream().map(room -> {
            boolean isCreator = room.getCreadorReporte().getId().equals(usuario.getId());
            Usuario interlocutor = isCreator ? room.getReclamante() : room.getCreadorReporte();

            String lastMsg = null;
            LocalDateTime lastMsgTime = null;
            var lastMsgOpt = chatMessageRepository.findFirstByChatRoomIdOrderByCreatedAtDesc(room.getId());
            if (lastMsgOpt.isPresent()) {
                lastMsg = lastMsgOpt.get().getContenido();
                lastMsgTime = lastMsgOpt.get().getCreatedAt();
            }

            String firstImgUrl = null;
            if (room.getReporte().getImagenes() != null && !room.getReporte().getImagenes().isEmpty()) {
                firstImgUrl = room.getReporte().getImagenes().get(0).getUrlCloudinary();
            }

            return ChatRoomResponse.builder()
                    .id(room.getId())
                    .reporteId(room.getReporte().getId())
                    .reporteNombreObjeto(room.getReporte().getNombreObjeto())
                    .reporteTipo(room.getReporte().getTipo())
                    .reporteEstado(room.getReporte().getEstado())
                    .reporteImagenUrl(firstImgUrl)
                    .interlocutorId(interlocutor.getId())
                    .interlocutorNombre(interlocutor.getNombreCompleto())
                    .interlocutorFotoUrl(interlocutor.getFotoUrl())
                    .creadorReporteId(room.getCreadorReporte().getId())
                    .activo(room.getActivo())
                    .fechaConfirmacionEntrega(room.getFechaConfirmacionEntrega())
                    .ultimoMensaje(lastMsg)
                    .ultimoMensajeHora(lastMsgTime)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getRoomMessages(Usuario usuario, Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversación no encontrada."));

        validateMembership(usuario, room);

        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId);
        return messages.stream().map(this::mapToMessageResponse).collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(Usuario usuario, Long roomId, SendChatMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversación no encontrada."));

        validateMembership(usuario, room);

        if (!room.getActivo()) {
            throw new RuntimeException("Esta conversación está cerrada (modo solo lectura).");
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .remitente(usuario)
                .contenido(request.getContenido().trim())
                .build();

        chatMessageRepository.save(message);

        ChatMessageResponse response = mapToMessageResponse(message);

        // Broadcast messages over websocket
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);

        // Disparar notificación inteligente si el interlocutor no está en la sala activa
        boolean isCreator = room.getCreadorReporte().getId().equals(usuario.getId());
        Usuario interlocutor = isCreator ? room.getReclamante() : room.getCreadorReporte();

        if (!subscriptionListener.isUserActiveInChat(interlocutor.getId(), roomId)) {
            notificationService.crearNotificacion(
                    interlocutor,
                    "Nuevo mensaje de chat",
                    usuario.getNombreCompleto() + ": " + message.getContenido(),
                    "CHAT_MENSAJE",
                    "/mensajes"
            );
        }

        return response;
    }

    @Transactional
    public ChatRoomResponse confirmDelivery(Usuario usuario, Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversación no encontrada."));

        if (!room.getCreadorReporte().getId().equals(usuario.getId())) {
            throw new RuntimeException("Solo el propietario del reporte puede confirmar la entrega.");
        }

        if (!room.getActivo()) {
            throw new RuntimeException("La entrega ya fue confirmada previamente.");
        }

        // Update Reporte status to RECUPERADO
        Reporte reporte = room.getReporte();
        reporte.setEstado("RECUPERADO");
        reporteRepository.save(reporte);

        // Update ChatRoom to inactive
        room.setActivo(false);
        room.setFechaConfirmacionEntrega(LocalDateTime.now());
        chatRoomRepository.save(room);

        String firstImgUrl = null;
        if (reporte.getImagenes() != null && !reporte.getImagenes().isEmpty()) {
            firstImgUrl = reporte.getImagenes().get(0).getUrlCloudinary();
        }

        boolean isCreator = room.getCreadorReporte().getId().equals(usuario.getId());
        Usuario interlocutor = isCreator ? room.getReclamante() : room.getCreadorReporte();

        ChatRoomResponse response = ChatRoomResponse.builder()
                .id(room.getId())
                .reporteId(reporte.getId())
                .reporteNombreObjeto(reporte.getNombreObjeto())
                .reporteTipo(reporte.getTipo())
                .reporteEstado(reporte.getEstado())
                .reporteImagenUrl(firstImgUrl)
                .interlocutorId(interlocutor.getId())
                .interlocutorNombre(interlocutor.getNombreCompleto())
                .interlocutorFotoUrl(interlocutor.getFotoUrl())
                .creadorReporteId(room.getCreadorReporte().getId())
                .activo(room.getActivo())
                .fechaConfirmacionEntrega(room.getFechaConfirmacionEntrega())
                .build();

        // Broadcast room closure event
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/close", response);

        return response;
    }

    private void validateMembership(Usuario usuario, ChatRoom room) {
        boolean isCreator = room.getCreadorReporte().getId().equals(usuario.getId());
        boolean isClaimant = room.getReclamante().getId().equals(usuario.getId());
        if (!isCreator && !isClaimant) {
            throw new AccessDeniedException("No tienes permiso para acceder a esta conversación.");
        }
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage msg) {
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .chatRoomId(msg.getChatRoom().getId())
                .remitenteId(msg.getRemitente().getId())
                .remitenteNombre(msg.getRemitente().getNombreCompleto())
                .remitenteFotoUrl(msg.getRemitente().getFotoUrl())
                .contenido(msg.getContenido())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
