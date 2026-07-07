package com.david.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {

    private String contenido;
    private String imagenUrl;

    public SendChatMessageRequest(String contenido) {
        this.contenido = contenido;
    }
}
