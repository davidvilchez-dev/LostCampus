package com.david.backend.controller;

import com.david.backend.dto.response.ChatMessageResponse;
import com.david.backend.dto.response.ChatRoomResponse;
import com.david.backend.model.Usuario;
import com.david.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getRoomsForUser(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(chatService.getRoomsForUser(usuario));
    }

    @GetMapping("/{id}/mensajes")
    public ResponseEntity<List<ChatMessageResponse>> getRoomMessages(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatService.getRoomMessages(usuario, id));
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<ChatRoomResponse> confirmDelivery(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatService.confirmDelivery(usuario, id));
    }
}
