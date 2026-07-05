package com.david.backend.event;

import com.david.backend.model.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
@Slf4j
public class WebSocketSubscriptionListener {

    // Mapea usuarioId -> roomId activo en pantalla
    private final ConcurrentMap<Long, Long> activeChatSessions = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        Principal principal = accessor.getUser();

        if (destination != null && destination.startsWith("/topic/chat/") && principal instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof Usuario usuario) {
                try {
                    Long roomId = Long.parseLong(destination.substring("/topic/chat/".length()));
                    activeChatSessions.put(usuario.getId(), roomId);
                    log.info("Usuario {} ({}) se suscribió al chat room {}", usuario.getId(), usuario.getNombreCompleto(), roomId);
                } catch (NumberFormatException e) {
                    log.warn("Formato de sala inválido en suscripción: {}", destination);
                }
            }
        }
    }

    @EventListener
    public void handleSessionUnsubscribe(SessionUnsubscribeEvent event) {
        removeUserSession(event.getMessage().getHeaders().get("simpUser"));
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        removeUserSession(event.getUser());
    }

    private void removeUserSession(Object userObj) {
        if (userObj instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof Usuario usuario) {
                activeChatSessions.remove(usuario.getId());
                log.info("Usuario {} ({}) cerró sesión/suscripción de chat", usuario.getId(), usuario.getNombreCompleto());
            }
        }
    }

    /**
     * Verifica si el usuario está visualizando activamente el chat dado.
     */
    public boolean isUserActiveInChat(Long usuarioId, Long roomId) {
        Long activeRoomId = activeChatSessions.get(usuarioId);
        return activeRoomId != null && activeRoomId.equals(roomId);
    }
}
