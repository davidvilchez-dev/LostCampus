package com.david.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyAccountRequest {

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El formato del correo es inválido.")
    private String correo;

    @NotBlank(message = "El código de verificación es obligatorio.")
    private String codigo;
}
