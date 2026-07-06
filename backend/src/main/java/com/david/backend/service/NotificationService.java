package com.david.backend.service;

import com.david.backend.dto.response.NotificationResponse;
import com.david.backend.model.Notificacion;
import com.david.backend.model.Usuario;
import com.david.backend.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationService {

    private final NotificacionRepository notificacionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    /**
     * Crear una notificación, persistirla, y enviarla por WebSocket + Email simulado.
     */
    public NotificationResponse crearNotificacion(Usuario destinatario, String titulo, String mensaje, String tipo, String enlace) {
        Notificacion notificacion = Notificacion.builder()
                .usuario(destinatario)
                .titulo(titulo)
                .mensaje(mensaje)
                .tipo(tipo)
                .enlace(enlace)
                .leido(false)
                .build();

        Notificacion saved = notificacionRepository.save(notificacion);
        NotificationResponse response = NotificationResponse.fromEntity(saved);

        // 1. Enviar notificación en tiempo real vía WebSocket
        try {
            String destination = "/topic/notifications/" + destinatario.getId();
            messagingTemplate.convertAndSend(destination, response);
            log.info("Notificación WebSocket enviada a {}: {}", destination, response.getTitulo());
        } catch (Exception e) {
            log.error("Error al enviar notificación por WebSocket", e);
        }

        // 2. Enviar correo real
        emailService.enviarNotificacion(destinatario.getCorreo(), titulo, mensaje);

        return response;
    }

    /**
     * Obtener las últimas 15 notificaciones para un usuario.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificaciones(Usuario usuario) {
        return notificacionRepository.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId())
                .stream()
                .limit(15)
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    /**
     * Contar las notificaciones no leídas para un usuario.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Usuario usuario) {
        return notificacionRepository.countByUsuarioIdAndLeidoFalse(usuario.getId());
    }

    /**
     * Marcar una notificación individual como leída.
     */
    public NotificationResponse markAsRead(Usuario usuario, Long notificationId) {
        Notificacion notificacion = notificacionRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada."));

        if (!notificacion.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para modificar esta notificación.");
        }

        notificacion.setLeido(true);
        Notificacion saved = notificacionRepository.save(notificacion);
        return NotificationResponse.fromEntity(saved);
    }

    /**
     * Marcar todas las notificaciones como leídas de forma masiva.
     */
    public void markAllAsRead(Usuario usuario) {
        notificacionRepository.markAllAsReadByUsuarioId(usuario.getId());
    }

}
