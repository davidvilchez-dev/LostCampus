package com.david.backend.controller;

import com.david.backend.dto.response.NotificationResponse;
import com.david.backend.model.Usuario;
import com.david.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotificaciones(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(notificationService.getNotificaciones(usuario));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(notificationService.getUnreadCount(usuario));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(usuario, id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal Usuario usuario) {
        notificationService.markAllAsRead(usuario);
        return ResponseEntity.ok().build();
    }
}
