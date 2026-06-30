package com.david.backend.service;

import com.david.backend.dto.request.UpdateProfileRequest;
import com.david.backend.dto.response.UserResponse;
import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsuarioRepository usuarioRepository;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder passwordEncoder;

    /**
     * HU-04: Obtener perfil del usuario autenticado
     */
    public UserResponse getProfile(Usuario usuario) {
        return UserResponse.fromEntity(usuario);
    }

    /**
     * HU-04: Actualizar nombre y foto de perfil
     */
    public UserResponse updateProfile(Usuario usuario, UpdateProfileRequest request) {
        if (request.getNombreCompleto() != null && !request.getNombreCompleto().isBlank()) {
            usuario.setNombreCompleto(request.getNombreCompleto());
        }
        if (request.getFotoUrl() != null) {
            usuario.setFotoUrl(request.getFotoUrl());
        }

        usuarioRepository.save(usuario);
        return UserResponse.fromEntity(usuario);
    }

    /**
     * HU-04: Subir avatar a Cloudinary
     */
    public UserResponse uploadAvatar(Usuario usuario, MultipartFile file) throws IOException {
        Map<String, Object> result = cloudinaryService.uploadImage(file, "lostcampus/avatars");
        String url = (String) result.get("secure_url");

        usuario.setFotoUrl(url);
        usuarioRepository.save(usuario);

        return UserResponse.fromEntity(usuario);
    }

    /**
     * HU-04: Cambiar contraseña
     */
    public void changePassword(Usuario usuario, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, usuario.getContrasenaHash())) {
            throw new RuntimeException("La contraseña actual es incorrecta.");
        }

        usuario.setContrasenaHash(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);
    }
}
