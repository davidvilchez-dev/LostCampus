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

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    /**
     * HU-01: Registro de usuario (ahora envía código de verificación)
     */
    public MessageResponse register(RegisterRequest request) {
        // Validar que el correo sea único
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado.");
        }

        // Generar código de verificación de 6 dígitos
        String codigo = generarCodigo6Digitos();

        // Crear el usuario con cuenta NO verificada
        Usuario usuario = Usuario.builder()
                .nombreCompleto(request.getNombreCompleto())
                .correo(request.getCorreo())
                .contrasenaHash(passwordEncoder.encode(request.getContrasena()))
                .cuentaVerificada(false)
                .codigoVerificacion(codigo)
                .codigoExpiracion(LocalDateTime.now().plusMinutes(15))
                .build();

        usuarioRepository.save(usuario);

        // Enviar código por correo real
        emailService.enviarCodigoVerificacion(usuario.getCorreo(), codigo);

        return MessageResponse.builder()
                .mensaje("Se ha enviado un código de verificación a " + request.getCorreo() + ".")
                .build();
    }

    /**
     * Verificar cuenta con código de 6 dígitos
     */
    public AuthResponse verificarCuenta(VerifyAccountRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("No se encontró una cuenta con ese correo."));

        if (Boolean.TRUE.equals(usuario.getCuentaVerificada())) {
            throw new RuntimeException("La cuenta ya está verificada.");
        }

        if (usuario.getCodigoVerificacion() == null ||
                !usuario.getCodigoVerificacion().equals(request.getCodigo())) {
            throw new RuntimeException("El código de verificación es incorrecto.");
        }

        if (usuario.getCodigoExpiracion() == null ||
                usuario.getCodigoExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código de verificación ha expirado. Solicita uno nuevo.");
        }

        // Marcar como verificada y limpiar código
        usuario.setCuentaVerificada(true);
        usuario.setCodigoVerificacion(null);
        usuario.setCodigoExpiracion(null);
        usuarioRepository.save(usuario);

        // Generar JWT y retornar
        String token = jwtTokenProvider.generateToken(usuario.getCorreo());
        return AuthResponse.builder()
                .token(token)
                .usuario(UserResponse.fromEntity(usuario))
                .build();
    }

    /**
     * Reenviar código de verificación
     */
    public MessageResponse reenviarCodigo(ResendCodeRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("No se encontró una cuenta con ese correo."));

        if (Boolean.TRUE.equals(usuario.getCuentaVerificada())) {
            throw new RuntimeException("La cuenta ya está verificada.");
        }

        String codigo = generarCodigo6Digitos();
        usuario.setCodigoVerificacion(codigo);
        usuario.setCodigoExpiracion(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        emailService.enviarCodigoVerificacion(usuario.getCorreo(), codigo);

        return MessageResponse.builder()
                .mensaje("Se ha reenviado el código de verificación a " + request.getCorreo() + ".")
                .build();
    }

    /**
     * HU-02: Inicio de sesión (verifica que la cuenta esté verificada)
     */
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas."));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasenaHash())) {
            throw new RuntimeException("Credenciales incorrectas.");
        }

        if (!Boolean.TRUE.equals(usuario.getCuentaVerificada())) {
            throw new RuntimeException("CUENTA_NO_VERIFICADA");
        }

        String token = jwtTokenProvider.generateToken(usuario.getCorreo());
        return AuthResponse.builder()
                .token(token)
                .usuario(UserResponse.fromEntity(usuario))
                .build();
    }

    /**
     * HU-05: Solicitar recuperación de contraseña (ahora envía correo real)
     */
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("No se encontró una cuenta con ese correo."));

        // Generar token de recuperación
        String token = UUID.randomUUID().toString();
        usuario.setTokenRecuperacion(token);
        usuario.setTokenExpiracion(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        // Enviar correo real con enlace de recuperación
        emailService.enviarRecuperacionContrasena(usuario.getCorreo(), token);

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

    /**
     * Genera un código aleatorio de 6 dígitos.
     */
    private String generarCodigo6Digitos() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
