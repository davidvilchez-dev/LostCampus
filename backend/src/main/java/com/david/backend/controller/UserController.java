package com.david.backend.controller;

import com.david.backend.dto.request.UpdateProfileRequest;
import com.david.backend.dto.response.MessageResponse;
import com.david.backend.dto.response.UserResponse;
import com.david.backend.model.Usuario;
import com.david.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * HU-04: GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(userService.getProfile(usuario));
    }

    /**
     * HU-04: PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(usuario, request));
    }

    /**
     * HU-04: POST /api/users/me/avatar
     */
    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> uploadAvatar(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(userService.uploadAvatar(usuario, file));
    }

    /**
     * HU-04: PUT /api/users/me/password
     */
    @PutMapping("/me/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal Usuario usuario,
            @RequestBody Map<String, String> body) {
        String currentPassword = body.get("contrasenaActual");
        String newPassword = body.get("nuevaContrasena");

        if (currentPassword == null || newPassword == null) {
            throw new RuntimeException("Se requieren la contraseña actual y la nueva.");
        }

        userService.changePassword(usuario, currentPassword, newPassword);
        return ResponseEntity.ok(MessageResponse.builder()
                .mensaje("Contraseña actualizada correctamente.")
                .build());
    }
}
