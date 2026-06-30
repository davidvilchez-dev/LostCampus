package com.david.backend.service;

import com.david.backend.dto.request.ForgotPasswordRequest;
import com.david.backend.dto.request.LoginRequest;
import com.david.backend.dto.request.RegisterRequest;
import com.david.backend.dto.request.ResetPasswordRequest;
import com.david.backend.dto.response.AuthResponse;
import com.david.backend.dto.response.MessageResponse;
import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
import com.david.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private Usuario testUser;

    @BeforeEach
    void setUp() {
        testUser = Usuario.builder()
                .id(1L)
                .nombreCompleto("David Perez")
                .correo("david@unsch.edu.pe")
                .contrasenaHash("encoded_password")
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setNombreCompleto("David Perez");
        request.setCorreo("david@unsch.edu.pe");
        request.setContrasena("admin123");

        when(usuarioRepository.existsByCorreo(request.getCorreo())).thenReturn(false);
        when(passwordEncoder.encode(request.getContrasena())).thenReturn("encoded_password");
        when(jwtTokenProvider.generateToken(request.getCorreo())).thenReturn("mocked_token");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked_token", response.getToken());
        assertEquals("David Perez", response.getUsuario().getNombreCompleto());
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setCorreo("david@unsch.edu.pe");

        when(usuarioRepository.existsByCorreo(request.getCorreo())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(request));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("david@unsch.edu.pe");
        request.setContrasena("admin123");

        when(usuarioRepository.findByCorreo(request.getCorreo())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getContrasena(), testUser.getContrasenaHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(request.getCorreo())).thenReturn("mocked_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked_token", response.getToken());
        assertEquals("David Perez", response.getUsuario().getNombreCompleto());
    }

    @Test
    void login_WrongPassword_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("david@unsch.edu.pe");
        request.setContrasena("wrong_password");

        when(usuarioRepository.findByCorreo(request.getCorreo())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getContrasena(), testUser.getContrasenaHash())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    void forgotPassword_Success() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setCorreo("david@unsch.edu.pe");

        when(usuarioRepository.findByCorreo(request.getCorreo())).thenReturn(Optional.of(testUser));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);

        MessageResponse response = authService.forgotPassword(request);

        assertNotNull(response);
        assertTrue(response.getMensaje().contains("david@unsch.edu.pe"));
        assertNotNull(testUser.getTokenRecuperacion());
        assertNotNull(testUser.getTokenExpiracion());
        verify(usuarioRepository).save(testUser);
    }

    @Test
    void resetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid_token");
        request.setNuevaContrasena("new_password");

        testUser.setTokenRecuperacion("valid_token");
        testUser.setTokenExpiracion(LocalDateTime.now().plusMinutes(10));

        when(usuarioRepository.findByTokenRecuperacion(request.getToken())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(request.getNuevaContrasena())).thenReturn("encoded_new_password");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);

        MessageResponse response = authService.resetPassword(request);

        assertNotNull(response);
        assertEquals("La contraseña se ha restablecido correctamente.", response.getMensaje());
        assertNull(testUser.getTokenRecuperacion());
        assertNull(testUser.getTokenExpiracion());
        verify(usuarioRepository).save(testUser);
    }
}
