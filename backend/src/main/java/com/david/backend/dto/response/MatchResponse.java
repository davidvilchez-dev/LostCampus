package com.david.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class MatchResponse extends ReportResponse {
    private Double score;

    public MatchResponse(ReportResponse reportResponse, Double score) {
        super(
            reportResponse.getId(),
            reportResponse.getTipo(),
            reportResponse.getEstado(),
            reportResponse.getNombreObjeto(),
            reportResponse.getDescripcion(),
            reportResponse.getLugar(),
            reportResponse.getFechaIncidente(),
            reportResponse.getCategoriaNombre(),
            reportResponse.getCategoriaIcono(),
            reportResponse.getAutorId(),
            reportResponse.getAutorNombre(),
            reportResponse.getAutorFotoUrl(),
            reportResponse.getImagenesUrls(),
            reportResponse.getCreatedAt()
        );
        this.score = score;
    }
}
