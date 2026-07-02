package com.david.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClaimRequest {

    @NotNull(message = "El ID del reporte es obligatorio.")
    private Long reporteId;

    @NotBlank(message = "El mensaje de prueba/evidencia es obligatorio.")
    @Size(min = 10, message = "La justificación debe tener al menos 10 caracteres.")
    private String mensajePrueba;
}
