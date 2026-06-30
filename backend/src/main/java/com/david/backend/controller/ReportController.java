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
     * HU-09/HU-10: GET /api/reports?q=&page=&size=
     */
    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getReports(q, page, size));
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
