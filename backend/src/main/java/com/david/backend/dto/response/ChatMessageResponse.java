package com.david.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long chatRoomId;
    private Long remitenteId;
    private String remitenteNombre;
    private String remitenteFotoUrl;
    private String contenido;
    private String imagenUrl;
    private LocalDateTime createdAt;
}
