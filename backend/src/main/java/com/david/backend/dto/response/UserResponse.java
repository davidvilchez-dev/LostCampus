package com.david.backend.dto.response;

import com.david.backend.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nombreCompleto;
    private String correo;
    private String fotoUrl;
    private Boolean esAdmin;

    public static UserResponse fromEntity(Usuario usuario) {
        return UserResponse.builder()
                .id(usuario.getId())
                .nombreCompleto(usuario.getNombreCompleto())
                .correo(usuario.getCorreo())
                .fotoUrl(usuario.getFotoUrl())
                .esAdmin(usuario.getEsAdmin())
                .build();
    }
}
