package com.david.backend.dto.response;

import com.david.backend.model.HistorialEstadoReporte;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HistorialEstadoResponse {
    private Long id;
    private Long reporteId;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDateTime fechaCambio;

    public static HistorialEstadoResponse fromEntity(HistorialEstadoReporte entity) {
        return HistorialEstadoResponse.builder()
                .id(entity.getId())
                .reporteId(entity.getReporte().getId())
                .estadoAnterior(entity.getEstadoAnterior())
                .estadoNuevo(entity.getEstadoNuevo())
                .fechaCambio(entity.getFechaCambio())
                .build();
    }
}
