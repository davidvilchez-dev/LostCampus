package com.david.backend.dto.response;

import com.david.backend.model.Reporte;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private String tipo;
    private String estado;
    private String nombreObjeto;
    private String descripcion;
    private String lugar;
    private LocalDate fechaIncidente;
    private String categoriaNombre;
    private String categoriaIcono;
    private Long autorId;
    private String autorNombre;
    private String autorFotoUrl;
    private List<String> imagenesUrls;
    private LocalDateTime createdAt;

    public static ReportResponse fromEntity(Reporte reporte) {
        List<String> urls = reporte.getImagenes().stream()
                .map(img -> img.getUrlCloudinary())
                .toList();

        return ReportResponse.builder()
                .id(reporte.getId())
                .tipo(reporte.getTipo())
                .estado(reporte.getEstado())
                .nombreObjeto(reporte.getNombreObjeto())
                .descripcion(reporte.getDescripcion())
                .lugar(reporte.getLugar())
                .fechaIncidente(reporte.getFechaIncidente())
                .categoriaNombre(reporte.getCategoria().getNombre())
                .categoriaIcono(reporte.getCategoria().getIcono())
                .autorId(reporte.getUsuario().getId())
                .autorNombre(reporte.getUsuario().getNombreCompleto())
                .autorFotoUrl(reporte.getUsuario().getFotoUrl())
                .imagenesUrls(urls)
                .createdAt(reporte.getCreatedAt())
                .build();
    }
}
