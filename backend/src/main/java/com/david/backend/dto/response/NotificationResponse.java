package com.david.backend.dto.response;

import com.david.backend.model.Notificacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String titulo;
    private String mensaje;
    private String tipo;
    private Boolean leido;
    private String enlace;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notificacion notificacion) {
        if (notificacion == null) return null;
        return NotificationResponse.builder()
                .id(notificacion.getId())
                .titulo(notificacion.getTitulo())
                .mensaje(notificacion.getMensaje())
                .tipo(notificacion.getTipo())
                .leido(notificacion.getLeido())
                .enlace(notificacion.getEnlace())
                .createdAt(notificacion.getCreatedAt())
                .build();
    }
}
