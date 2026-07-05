package com.david.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateClaimRequest {

    @NotNull(message = "El ID del reporte es obligatorio.")
    private Long reporteId;

    private String mensajePrueba;
}
