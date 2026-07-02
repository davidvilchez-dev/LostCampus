package com.david.backend.controller;

import com.david.backend.dto.request.CreateClaimRequest;
import com.david.backend.dto.response.ClaimResponse;
import com.david.backend.model.Usuario;
import com.david.backend.service.SolicitudReclamacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reclamaciones")
@RequiredArgsConstructor
public class SolicitudReclamacionController {

    private final SolicitudReclamacionService claimService;

    @PostMapping
    public ResponseEntity<ClaimResponse> enviarSolicitud(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CreateClaimRequest request) {
        ClaimResponse response = claimService.enviarSolicitud(usuario, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/enviadas")
    public ResponseEntity<List<ClaimResponse>> listarEnviadas(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(claimService.listarEnviadas(usuario));
    }

    @GetMapping("/recibidas")
    public ResponseEntity<List<ClaimResponse>> listarRecibidas(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(claimService.listarRecibidas(usuario));
    }

    @PostMapping("/{id}/aceptar")
    public ResponseEntity<ClaimResponse> aceptarSolicitud(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(claimService.aceptarSolicitud(usuario, id));
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<ClaimResponse> rechazarSolicitud(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(claimService.rechazarSolicitud(usuario, id));
    }
}
