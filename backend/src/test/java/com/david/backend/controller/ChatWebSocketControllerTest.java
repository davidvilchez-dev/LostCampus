package com.david.backend.controller;

import com.david.backend.dto.request.SendChatMessageRequest;
import com.david.backend.model.Usuario;
import com.david.backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.security.Principal;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatWebSocketControllerTest {

    @Mock
    private ChatService chatService;

    @InjectMocks
    private ChatWebSocketController chatWebSocketController;

    @Test
    void sendMessage_NullPrincipal_ThrowsException() {
        SendChatMessageRequest request = new SendChatMessageRequest("Hola");
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> 
            chatWebSocketController.sendMessage(1L, request, null)
        );
    }

    @Test
    void sendMessage_Success() {
        Usuario user = Usuario.builder().id(10L).nombreCompleto("David").build();
        UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(user, null);
        SendChatMessageRequest request = new SendChatMessageRequest("Hola");

        chatWebSocketController.sendMessage(1L, request, principal);

        verify(chatService, times(1)).sendMessage(user, 1L, request);
    }
}
