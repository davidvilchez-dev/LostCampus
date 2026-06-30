package com.david.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "El nombre completo es obligatorio.")
    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres.")
    private String nombreCompleto;

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El formato del correo es inválido.")
    @Size(max = 200, message = "El correo no puede exceder 200 caracteres.")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres.")
    private String contrasena;
}
