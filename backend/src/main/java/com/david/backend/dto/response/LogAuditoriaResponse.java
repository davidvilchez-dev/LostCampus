package com.david.backend.dto.response;

import com.david.backend.model.LogAuditoriaAdmin;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LogAuditoriaResponse {
    private Long id;
    private Long adminId;
    private String adminNombre;
    private String accion;
    private Long reporteId;
    private String detalles;
    private LocalDateTime fechaAccion;

    public static LogAuditoriaResponse fromEntity(LogAuditoriaAdmin entity) {
        return LogAuditoriaResponse.builder()
                .id(entity.getId())
                .adminId(entity.getAdmin().getId())
                .adminNombre(entity.getAdmin().getNombreCompleto())
                .accion(entity.getAccion())
                .reporteId(entity.getReporteId())
                .detalles(entity.getDetalles())
                .fechaAccion(entity.getFechaAccion())
                .build();
    }
}
