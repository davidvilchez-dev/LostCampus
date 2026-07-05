package com.david.backend.controller;

import com.david.backend.dto.request.UpdateReportStatusRequest;
import com.david.backend.dto.response.LogAuditoriaResponse;
import com.david.backend.dto.response.ReportResponse;
import com.david.backend.model.Usuario;
import com.david.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/reportes")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> categorias,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String lugar,
            @RequestParam(required = false, name = "start_date") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false, name = "end_date") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sort) {
        return ResponseEntity.ok(adminService.getAdminReports(
                q, categorias, tipo, lugar, startDate, endDate, estado, page, size, sort
        ));
    }

    @PutMapping("/reportes/{id}/estado")
    public ResponseEntity<ReportResponse> cambiarEstadoReporte(
            @AuthenticationPrincipal Usuario admin,
            @PathVariable Long id,
            @RequestBody @jakarta.validation.Valid UpdateReportStatusRequest request) {
        return ResponseEntity.ok(adminService.cambiarEstadoReporte(admin, id, request.getEstado()));
    }

    @DeleteMapping("/reportes/{id}")
    public ResponseEntity<Void> eliminarReporte(
            @AuthenticationPrincipal Usuario admin,
            @PathVariable Long id,
            @RequestParam(defaultValue = "Incumplimiento de normas de la comunidad") String motivo) {
        adminService.eliminarReporte(admin, id, motivo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/auditoria")
    public ResponseEntity<List<LogAuditoriaResponse>> getAuditLogs() {
        List<LogAuditoriaResponse> logs = adminService.getAuditLogs()
                .stream()
                .map(LogAuditoriaResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(logs);
    }
}
