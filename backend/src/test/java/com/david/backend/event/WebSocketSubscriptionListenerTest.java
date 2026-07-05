package com.david.backend.event;

import com.david.backend.model.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class WebSocketSubscriptionListenerTest {

    private final WebSocketSubscriptionListener listener = new WebSocketSubscriptionListener();

    @Test
    void testSubscribeAndUnsubscribeAndDisconnect() {
        Usuario user = Usuario.builder().id(50L).nombreCompleto("David Test").build();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null);

        // 1. Subscribe to a valid room
        Map<String, Object> headers = new HashMap<>();
        headers.put("simpDestination", "/topic/chat/100");
        headers.put("simpUser", auth);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], new MessageHeaders(headers));

        SessionSubscribeEvent subscribeEvent = new SessionSubscribeEvent(this, message, auth);
        listener.handleSessionSubscribe(subscribeEvent);

        assertTrue(listener.isUserActiveInChat(50L, 100L));
        assertFalse(listener.isUserActiveInChat(50L, 200L));

        // 2. Unsubscribe
        SessionUnsubscribeEvent unsubscribeEvent = new SessionUnsubscribeEvent(this, message, auth);
        listener.handleSessionUnsubscribe(unsubscribeEvent);
        assertFalse(listener.isUserActiveInChat(50L, 100L));

        // 3. Subscribe again and then Disconnect
        listener.handleSessionSubscribe(subscribeEvent);
        assertTrue(listener.isUserActiveInChat(50L, 100L));

        SessionDisconnectEvent disconnectEvent = new SessionDisconnectEvent(this, message, "session-id", null, auth);
        listener.handleSessionDisconnect(disconnectEvent);
        assertFalse(listener.isUserActiveInChat(50L, 100L));
    }

    @Test
    void testSubscribeInvalidRoomFormat() {
        Usuario user = Usuario.builder().id(50L).nombreCompleto("David Test").build();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null);

        Map<String, Object> headers = new HashMap<>();
        headers.put("simpDestination", "/topic/chat/not-a-number");
        headers.put("simpUser", auth);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], new MessageHeaders(headers));

        SessionSubscribeEvent subscribeEvent = new SessionSubscribeEvent(this, message, auth);
        listener.handleSessionSubscribe(subscribeEvent);

        assertFalse(listener.isUserActiveInChat(50L, 100L));
    }
}
