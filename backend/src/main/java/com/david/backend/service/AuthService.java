package com.david.backend.service;

import com.david.backend.dto.request.*;
import com.david.backend.dto.response.AuthResponse;
import com.david.backend.dto.response.MessageResponse;
import com.david.backend.dto.response.UserResponse;
import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
import com.david.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * HU-01: Registro de usuario
     */
    public AuthResponse register(RegisterRequest request) {
        // Validar que el correo sea único
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado.");
        }

        // Crear el usuario
        Usuario usuario = Usuario.builder()
                .nombreCompleto(request.getNombreCompleto())
                .correo(request.getCorreo())
                .contrasenaHash(passwordEncoder.encode(request.getContrasena()))
                .build();

        usuarioRepository.save(usuario);

        // Generar JWT y retornar
        String token = jwtTokenProvider.generateToken(usuario.getCorreo());
        return AuthResponse.builder()
                .token(token)
                .usuario(UserResponse.fromEntity(usuario))
                .build();
    }

    /**
     * HU-02: Inicio de sesión
     */
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas."));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasenaHash())) {
            throw new RuntimeException("Credenciales incorrectas.");
        }

        String token = jwtTokenProvider.generateToken(usuario.getCorreo());
        return AuthResponse.builder()
                .token(token)
                .usuario(UserResponse.fromEntity(usuario))
                .build();
    }

    /**
     * HU-05: Solicitar recuperación de contraseña
     */
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("No se encontró una cuenta con ese correo."));

        // Generar token de recuperación
        String token = UUID.randomUUID().toString();
        usuario.setTokenRecuperacion(token);
        usuario.setTokenExpiracion(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        // En producción aquí se enviaría un correo real con el token.
        // Por ahora se registra en consola para desarrollo.
        System.out.println("===== TOKEN DE RECUPERACION =====");
        System.out.println("Correo: " + usuario.getCorreo());
        System.out.println("Token: " + token);
        System.out.println("Expira: " + usuario.getTokenExpiracion());
        System.out.println("=================================");

        return MessageResponse.builder()
                .mensaje("Se han enviado las instrucciones de recuperación al correo " + request.getCorreo() + ".")
                .build();
    }

    /**
     * HU-05: Restablecer contraseña con token
     */
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByTokenRecuperacion(request.getToken())
                .orElseThrow(() -> new RuntimeException("El token de recuperación es inválido."));

        if (usuario.getTokenExpiracion() == null || usuario.getTokenExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token de recuperación ha expirado.");
        }

        // Actualizar contraseña y limpiar token
        usuario.setContrasenaHash(passwordEncoder.encode(request.getNuevaContrasena()));
        usuario.setTokenRecuperacion(null);
        usuario.setTokenExpiracion(null);
        usuarioRepository.save(usuario);

        return MessageResponse.builder()
                .mensaje("La contraseña se ha restablecido correctamente.")
                .build();
    }
}
