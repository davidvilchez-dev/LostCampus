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
public class ChatRoomResponse {
    private Long id;
    private Long reporteId;
    private String reporteNombreObjeto;
    private String reporteTipo;
    private String reporteEstado;
    private String reporteImagenUrl;
    private Long interlocutorId;
    private String interlocutorNombre;
    private String interlocutorFotoUrl;
    private Long creadorReporteId;
    private Boolean activo;
    private LocalDateTime fechaConfirmacionEntrega;
    private String ultimoMensaje;
    private LocalDateTime ultimoMensajeHora;
}
