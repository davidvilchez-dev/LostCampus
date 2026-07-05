package com.david.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logs_auditoria_admin")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LogAuditoriaAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Usuario admin;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(name = "reporte_id")
    private Long reporteId;

    @Column(columnDefinition = "TEXT")
    private String detalles;

    @Column(name = "fecha_accion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaAccion = LocalDateTime.now();
}
