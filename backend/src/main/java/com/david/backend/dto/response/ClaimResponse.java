package com.david.backend.dto.response;

import com.david.backend.model.EstadoReclamacion;
import com.david.backend.model.SolicitudReclamacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ClaimResponse {
    private Long id;
    
    // Report info
    private Long reporteId;
    private String reporteNombreObjeto;
    private String reporteTipo;
    private String reporteEstado;
    private String reporteLugar;
    private String reporteFechaIncidente;
    private List<String> reporteImagenesUrls;
    private Long reporteAutorId;
    private String reporteAutorNombre;
    private String reporteAutorEmail;

    // Claimant info
    private Long reclamanteId;
    private String reclamanteNombre;
    private String reclamanteEmail;
    
    // Claim details
    private String mensajePrueba;
    private EstadoReclamacion estado;
    private LocalDateTime createdAt;

    public static ClaimResponse fromEntity(SolicitudReclamacion claim) {
        List<String> urls = claim.getReporte().getImagenes().stream()
                .map(img -> img.getUrlCloudinary())
                .toList();

        return ClaimResponse.builder()
                .id(claim.getId())
                .reporteId(claim.getReporte().getId())
                .reporteNombreObjeto(claim.getReporte().getNombreObjeto())
                .reporteTipo(claim.getReporte().getTipo())
                .reporteEstado(claim.getReporte().getEstado())
                .reporteLugar(claim.getReporte().getLugar())
                .reporteFechaIncidente(claim.getReporte().getFechaIncidente().toString())
                .reporteImagenesUrls(urls)
                .reporteAutorId(claim.getReporte().getUsuario().getId())
                .reporteAutorNombre(claim.getReporte().getUsuario().getNombreCompleto())
                .reporteAutorEmail(claim.getReporte().getUsuario().getCorreo())
                .reclamanteId(claim.getReclamante().getId())
                .reclamanteNombre(claim.getReclamante().getNombreCompleto())
                .reclamanteEmail(claim.getReclamante().getCorreo())
                .mensajePrueba(claim.getMensajePrueba())
                .estado(claim.getEstado())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
