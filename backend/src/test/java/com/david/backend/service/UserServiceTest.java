package com.david.backend.service;

import com.david.backend.dto.request.UpdateProfileRequest;
import com.david.backend.dto.response.UserResponse;
import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private Usuario testUser;

    @BeforeEach
    void setUp() {
        testUser = Usuario.builder()
                .id(1L)
                .nombreCompleto("David Perez")
                .correo("david@unsch.edu.pe")
                .contrasenaHash("encoded_password")
                .fotoUrl("http://example.com/avatar.jpg")
                .build();
    }

    @Test
    void getProfile_Success() {
        UserResponse response = userService.getProfile(testUser);
        assertNotNull(response);
        assertEquals("David Perez", response.getNombreCompleto());
        assertEquals("david@unsch.edu.pe", response.getCorreo());
    }

    @Test
    void updateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setNombreCompleto("David Vilchez");
        request.setFotoUrl("http://example.com/new_avatar.jpg");

        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);

        UserResponse response = userService.updateProfile(testUser, request);

        assertNotNull(response);
        assertEquals("David Vilchez", response.getNombreCompleto());
        assertEquals("http://example.com/new_avatar.jpg", response.getFotoUrl());
        verify(usuarioRepository).save(testUser);
    }

    @Test
    void uploadAvatar_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        Map<String, Object> uploadResult = Map.of("secure_url", "http://cloudinary.com/new_avatar.jpg");

        when(cloudinaryService.uploadImage(file, "lostcampus/avatars")).thenReturn(uploadResult);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);

        UserResponse response = userService.uploadAvatar(testUser, file);

        assertNotNull(response);
        assertEquals("http://cloudinary.com/new_avatar.jpg", response.getFotoUrl());
        verify(usuarioRepository).save(testUser);
    }

    @Test
    void changePassword_Success() {
        when(passwordEncoder.matches("current_password", testUser.getContrasenaHash())).thenReturn(true);
        when(passwordEncoder.encode("new_password")).thenReturn("encoded_new_password");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);

        userService.changePassword(testUser, "current_password", "new_password");

        verify(usuarioRepository).save(testUser);
        assertEquals("encoded_new_password", testUser.getContrasenaHash());
    }

    @Test
    void changePassword_WrongCurrentPassword_ThrowsException() {
        when(passwordEncoder.matches("wrong_password", testUser.getContrasenaHash())).thenReturn(false);

        assertThrows(RuntimeException.class, () ->
                userService.changePassword(testUser, "wrong_password", "new_password")
        );
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}
