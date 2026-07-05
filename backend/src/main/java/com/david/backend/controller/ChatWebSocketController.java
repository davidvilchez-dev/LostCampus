package com.david.backend.controller;

import com.david.backend.dto.request.SendChatMessageRequest;
import com.david.backend.model.Usuario;
import com.david.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload SendChatMessageRequest request,
            Principal principal) {

        if (principal == null) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("Usuario no autenticado");
        }

        Usuario usuario = (Usuario) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        chatService.sendMessage(usuario, roomId, request);
    }
}
