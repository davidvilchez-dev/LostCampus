package com.david.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estados_reportes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HistorialEstadoReporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporte_id", nullable = false)
    private Reporte reporte;

    @Column(name = "estado_anterior", length = 50)
    private String estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false, length = 50)
    private String estadoNuevo;

    @Column(name = "fecha_cambio", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCambio = LocalDateTime.now();
}
