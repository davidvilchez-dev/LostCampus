package com.david.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateReportRequest {

    @NotNull(message = "La categoría es obligatoria.")
    private Long categoriaId;

    @NotBlank(message = "El tipo de reporte es obligatorio.")
    private String tipo; // PERDIDO o ENCONTRADO

    @NotBlank(message = "El nombre del objeto es obligatorio.")
    @Size(max = 200, message = "El nombre del objeto no puede exceder 200 caracteres.")
    private String nombreObjeto;

    @NotBlank(message = "La descripción es obligatoria.")
    private String descripcion;

    @NotBlank(message = "El lugar es obligatorio.")
    @Size(max = 255, message = "El lugar no puede exceder 255 caracteres.")
    private String lugar;

    @NotNull(message = "La fecha del incidente es obligatoria.")
    private LocalDate fechaIncidente;
}
