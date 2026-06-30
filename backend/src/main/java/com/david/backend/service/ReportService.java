package com.david.backend.service;

import com.david.backend.dto.request.CreateReportRequest;
import com.david.backend.dto.response.ReportResponse;
import com.david.backend.model.*;
import com.david.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReporteRepository reporteRepository;
    private final CategoriaRepository categoriaRepository;
    private final ImagenReporteRepository imagenReporteRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * HU-06/HU-07: Crear reporte (PERDIDO o ENCONTRADO)
     */
    public ReportResponse createReport(Usuario usuario, CreateReportRequest request) {
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada."));

        String tipo = request.getTipo().toUpperCase();
        if (!tipo.equals("PERDIDO") && !tipo.equals("ENCONTRADO")) {
            throw new RuntimeException("El tipo debe ser PERDIDO o ENCONTRADO.");
        }

        Reporte reporte = Reporte.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipo(tipo)
                .nombreObjeto(request.getNombreObjeto())
                .descripcion(request.getDescripcion())
                .lugar(request.getLugar())
                .fechaIncidente(request.getFechaIncidente())
                .build();

        reporteRepository.save(reporte);
        return ReportResponse.fromEntity(reporte);
    }

    /**
     * HU-08: Subir imágenes a un reporte (máx. 3)
     */
    public ReportResponse uploadImages(Usuario usuario, Long reporteId, List<MultipartFile> files) throws IOException {
        Reporte reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado."));

        // Verificar que el reporte pertenece al usuario
        if (!reporte.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para modificar este reporte.");
        }

        long currentImages = imagenReporteRepository.countByReporteId(reporteId);
        if (currentImages + files.size() > 3) {
            throw new RuntimeException(
                    "Un reporte puede tener máximo 3 imágenes. Actualmente tiene " + currentImages + ".");
        }

        for (int i = 0; i < files.size(); i++) {
            Map<String, Object> result = cloudinaryService.uploadImage(files.get(i), "lostcampus/reports");
            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");

            ImagenReporte imagen = ImagenReporte.builder()
                    .reporte(reporte)
                    .urlCloudinary(url)
                    .publicIdCloudinary(publicId)
                    .orden((short) (currentImages + i + 1))
                    .build();

            imagenReporteRepository.save(imagen);
            reporte.getImagenes().add(imagen);
        }

        return ReportResponse.fromEntity(reporte);
    }

    /**
     * HU-09: Feed paginado de reportes recientes
     * HU-10: Búsqueda por palabras clave
     */
    public Page<ReportResponse> getReports(String query, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Reporte> reportes;

        if (query != null && !query.isBlank()) {
            reportes = reporteRepository.buscarPorPalabraClave(query.trim(), pageable);
        } else {
            reportes = reporteRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return reportes.map(ReportResponse::fromEntity);
    }

    /**
     * Listar reportes del usuario autenticado
     */
    public List<ReportResponse> getMyReports(Usuario usuario) {
        return reporteRepository.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId())
                .stream()
                .map(ReportResponse::fromEntity)
                .toList();
    }

    /**
     * Eliminar reporte propio
     */
    public void deleteReport(Usuario usuario, Long reporteId) {
        Reporte reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado."));

        if (!reporte.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este reporte.");
        }

        // Eliminar imágenes de Cloudinary
        for (ImagenReporte imagen : reporte.getImagenes()) {
            try {
                cloudinaryService.deleteImage(imagen.getPublicIdCloudinary());
            } catch (IOException e) {
                // Log pero no bloquear la eliminación
                System.err.println("Error eliminando imagen de Cloudinary: " + e.getMessage());
            }
        }

        reporteRepository.delete(reporte);
    }
}
