package com.david.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imagenes_reporte")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ImagenReporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporte_id", nullable = false)
    private Reporte reporte;

    @Column(name = "url_cloudinary", nullable = false, columnDefinition = "TEXT")
    private String urlCloudinary;

    @Column(name = "public_id_cloudinary", nullable = false, length = 255)
    private String publicIdCloudinary;

    @Column(nullable = false)
    @Builder.Default
    private Short orden = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
