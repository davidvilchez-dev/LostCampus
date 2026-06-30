package com.david.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres.")
    private String nombreCompleto;

    private String fotoUrl;
}
