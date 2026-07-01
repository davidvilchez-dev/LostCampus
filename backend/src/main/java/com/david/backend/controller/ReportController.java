package com.david.backend.controller;

import com.david.backend.dto.request.CreateReportRequest;
import com.david.backend.dto.response.MessageResponse;
import com.david.backend.dto.response.ReportResponse;
import com.david.backend.model.Usuario;
import com.david.backend.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * HU-06/HU-07: POST /api/reports
     */
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CreateReportRequest request) {
        ReportResponse response = reportService.createReport(usuario, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * HU-08: POST /api/reports/{id}/images
     */
    @PostMapping("/{id}/images")
    public ResponseEntity<ReportResponse> uploadImages(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) throws IOException {
        ReportResponse response = reportService.uploadImages(usuario, id, files);
        return ResponseEntity.ok(response);
    }

    /**
     * HU-09/HU-10/HU-11/HU-12/HU-13: GET /api/reports?q=&categorias=&tipo=&lugar=&start_date=&end_date=&page=&size=&sort=
     */
    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> categorias,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String lugar,
            @RequestParam(required = false, name = "start_date") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false, name = "end_date") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sort) {
        return ResponseEntity.ok(reportService.getReports(
                q, categorias, tipo, lugar, startDate, endDate, page, size, sort
        ));
    }

    /**
     * HU-12: GET /api/reports/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    /**
     * HU-13: PUT /api/reports/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReportResponse> updateReport(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @Valid @RequestBody CreateReportRequest request) {
        ReportResponse response = reportService.updateReport(usuario, id, request);
        return ResponseEntity.ok(response);
    }


    /**
     * GET /api/reports/mine
     */
    @GetMapping("/mine")
    public ResponseEntity<List<ReportResponse>> getMyReports(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(reportService.getMyReports(usuario));
    }

    /**
     * DELETE /api/reports/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteReport(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        reportService.deleteReport(usuario, id);
        return ResponseEntity.ok(MessageResponse.builder()
                .mensaje("Reporte eliminado correctamente.")
                .build());
    }
}
