package com.david.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reportes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 20)
    private String tipo; // PERDIDO o ENCONTRADO

    @Column(name = "nombre_objeto", nullable = false, length = 200)
    private String nombreObjeto;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 255)
    private String lugar;

    @Column(name = "fecha_incidente", nullable = false)
    private LocalDate fechaIncidente;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "ACTIVO";

    @OneToMany(mappedBy = "reporte", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImagenReporte> imagenes = new ArrayList<>();

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
