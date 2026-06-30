package com.david.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(nullable = false, unique = true, length = 200)
    private String correo;

    @Column(name = "contrasena_hash", nullable = false, length = 255)
    private String contrasenaHash;

    @Column(name = "foto_url", columnDefinition = "TEXT")
    private String fotoUrl;

    @Column(name = "es_admin", nullable = false)
    @Builder.Default
    private Boolean esAdmin = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // Campos para recuperación de contraseña (HU-05)
    @Column(name = "token_recuperacion", length = 255)
    private String tokenRecuperacion;

    @Column(name = "token_expiracion")
    private LocalDateTime tokenExpiracion;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
