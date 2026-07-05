package com.david.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClaimRequest {

    @NotNull(message = "El ID del reporte es obligatorio.")
    private Long reporteId;

    private String mensajePrueba;
}
