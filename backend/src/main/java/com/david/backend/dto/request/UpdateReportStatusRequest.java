package com.david.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UpdateReportStatusRequest {
    @NotBlank(message = "El nuevo estado es requerido.")
    private String estado;
}
