package com.david.backend.service;

import com.david.backend.dto.response.NotificationResponse;
import com.david.backend.model.Notificacion;
import com.david.backend.model.Usuario;
import com.david.backend.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    private Usuario testUser;
    private Notificacion testNotification;

    @BeforeEach
    void setUp() {
        testUser = Usuario.builder()
                .id(1L)
                .nombreCompleto("David Perez")
                .correo("david@unsch.edu.pe")
                .build();

        testNotification = Notificacion.builder()
                .id(100L)
                .usuario(testUser)
                .titulo("Test Titulo")
                .mensaje("Test Mensaje")
                .tipo("TEST")
                .leido(false)
                .enlace("/test")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void crearNotificacion_Success() {
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(testNotification);

        NotificationResponse response = notificationService.crearNotificacion(
                testUser,
                "Test Titulo",
                "Test Mensaje",
                "TEST",
                "/test"
        );

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Test Titulo", response.getTitulo());
        assertFalse(response.getLeido());
        verify(notificacionRepository).save(any(Notificacion.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/notifications/1"), any(NotificationResponse.class));
    }

    @Test
    void getNotificaciones_Success() {
        when(notificacionRepository.findByUsuarioIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(testNotification));

        List<NotificationResponse> result = notificationService.getNotificaciones(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Titulo", result.get(0).getTitulo());
        verify(notificacionRepository).findByUsuarioIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUnreadCount_Success() {
        when(notificacionRepository.countByUsuarioIdAndLeidoFalse(1L)).thenReturn(5L);

        long count = notificationService.getUnreadCount(testUser);

        assertEquals(5L, count);
        verify(notificacionRepository).countByUsuarioIdAndLeidoFalse(1L);
    }

    @Test
    void markAsRead_Success() {
        when(notificacionRepository.findById(100L)).thenReturn(Optional.of(testNotification));
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(testNotification);

        NotificationResponse response = notificationService.markAsRead(testUser, 100L);

        assertNotNull(response);
        assertTrue(testNotification.getLeido());
        verify(notificacionRepository).save(testNotification);
    }

    @Test
    void markAsRead_UnauthorizedUser_ThrowsException() {
        Usuario otherUser = Usuario.builder().id(99L).build();
        when(notificacionRepository.findById(100L)).thenReturn(Optional.of(testNotification));

        assertThrows(RuntimeException.class, () ->
                notificationService.markAsRead(otherUser, 100L)
        );
        verify(notificacionRepository, never()).save(any());
    }

    @Test
    void markAllAsRead_Success() {
        doNothing().when(notificacionRepository).markAllAsReadByUsuarioId(1L);

        notificationService.markAllAsRead(testUser);

        verify(notificacionRepository).markAllAsReadByUsuarioId(1L);
    }
}
