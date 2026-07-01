package com.david.backend.service;

import com.david.backend.dto.request.CreateReportRequest;
import com.david.backend.dto.response.ReportResponse;
import com.david.backend.model.*;
import com.david.backend.repository.*;
import com.david.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.temporal.ChronoUnit;
import java.util.*;
import com.david.backend.dto.response.MatchResponse;
import com.david.backend.util.SimilarityUtils;

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
        return getReports(query, null, null, null, null, null, page, size, "desc");
    }

    /**
     * HU-11, HU-12, HU-13: Obtener reportes filtrados y ordenados
     */
    public Page<ReportResponse> getReports(
            String query,
            List<Long> categoriaIds,
            String tipo,
            String lugar,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            int page,
            int size,
            String sortDirection
    ) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new RuntimeException("La fecha de inicio debe ser anterior o igual a la fecha de fin.");
        }

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by("createdAt");
        if ("asc".equalsIgnoreCase(sortDirection)) {
            sort = sort.ascending();
        } else {
            sort = sort.descending();
        }

        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, sort);

        org.springframework.data.jpa.domain.Specification<Reporte> spec = (root, q, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            if (query != null && !query.isBlank()) {
                String val = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nombreObjeto")), val),
                        cb.like(cb.lower(root.get("descripcion")), val),
                        cb.like(cb.lower(root.get("categoria").get("nombre")), val)
                ));
            }

            if (categoriaIds != null && !categoriaIds.isEmpty()) {
                predicates.add(root.get("categoria").get("id").in(categoriaIds));
            }

            if (tipo != null && !tipo.isBlank()) {
                predicates.add(cb.equal(root.get("tipo"), tipo.toUpperCase().trim()));
            }

            if (lugar != null && !lugar.isBlank()) {
                String val = "%" + lugar.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("lugar")), val));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaIncidente"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaIncidente"), endDate));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Reporte> reportes = reporteRepository.findAll(spec, pageable);
        return reportes.map(ReportResponse::fromEntity);
    }

    /**
     * HU-12: Obtener reporte por ID
     */
    public ReportResponse getReportById(Long id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado."));
        return ReportResponse.fromEntity(reporte);
    }

    /**
     * HU-13: Editar reporte propio
     */
    public ReportResponse updateReport(Usuario usuario, Long id, CreateReportRequest request) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado."));

        if (!reporte.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para modificar este reporte.");
        }

        if ("CERRADO".equalsIgnoreCase(reporte.getEstado())) {
            throw new RuntimeException("No se puede editar un reporte cerrado.");
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada."));

        String tipo = request.getTipo().toUpperCase();
        if (!tipo.equals("PERDIDO") && !tipo.equals("ENCONTRADO")) {
            throw new RuntimeException("El tipo debe ser PERDIDO o ENCONTRADO.");
        }

        reporte.setCategoria(categoria);
        reporte.setTipo(tipo);
        reporte.setNombreObjeto(request.getNombreObjeto());
        reporte.setDescripcion(request.getDescripcion());
        reporte.setLugar(request.getLugar());
        reporte.setFechaIncidente(request.getFechaIncidente());

        reporteRepository.save(reporte);
        return ReportResponse.fromEntity(reporte);
    }


    /**
     * HU-16: Marcar reporte como recuperado (resuelto)
     */
    public ReportResponse resolveReport(Usuario usuario, Long id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado."));

        if (!reporte.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para modificar este reporte.");
        }

        if ("CERRADO".equalsIgnoreCase(reporte.getEstado())) {
            throw new RuntimeException("El reporte ya se encuentra resuelto.");
        }

        reporte.setEstado("CERRADO");
        reporteRepository.save(reporte);
        return ReportResponse.fromEntity(reporte);
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

    /**
     * HU-17: Obtener coincidencias sugeridas basadas en algoritmo híbrido
     */
    public List<MatchResponse> getMatches(Usuario usuario, Long reportId) {
        Reporte reporteRef = reporteRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado."));

        if (!reporteRef.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para ver las coincidencias de este reporte.");
        }

        // Tipo opuesto
        String oppositeTipo = "PERDIDO".equalsIgnoreCase(reporteRef.getTipo()) ? "ENCONTRADO" : "PERDIDO";

        // Obtener candidatos de la misma categoría, tipo opuesto, activos y excluyendo el propio reporte y autor
        List<Reporte> candidates = reporteRepository.findCandidatesForMatching(
                reporteRef.getCategoria().getId(),
                oppositeTipo,
                reporteRef.getId(),
                usuario.getId()
        );

        List<MatchResponse> matches = new ArrayList<>();
        String textRef = (reporteRef.getNombreObjeto() + " " + reporteRef.getDescripcion()).toLowerCase();

        for (Reporte candidate : candidates) {
            // 1. Similitud Temporal (15%): Máxima diferencia de 30 días, linealizado a 1.0 - 0.0
            long daysBetween = Math.abs(ChronoUnit.DAYS.between(reporteRef.getFechaIncidente(), candidate.getFechaIncidente()));
            if (daysBetween > 30) {
                continue; // Supera la ventana temporal dura de 30 días
            }
            double timeScore = 1.0 - ((double) daysBetween / 30.0);

            // 2. Similitud Textual (60%): Coeficiente Jaccard sobre nombre y descripción
            String textCand = (candidate.getNombreObjeto() + " " + candidate.getDescripcion()).toLowerCase();
            double textScore = SimilarityUtils.calculateJaccardSimilarity(textRef, textCand);

            // 3. Similitud de Ubicación (25%): Jaccard sobre el campo lugar
            double placeScore = SimilarityUtils.calculateJaccardSimilarity(reporteRef.getLugar(), candidate.getLugar());

            // Puntuación combinada
            double totalScore = (textScore * 0.60) + (placeScore * 0.25) + (timeScore * 0.15);

            // Filtrar bajo el umbral del 30%
            if (totalScore >= 0.30) {
                // Redondear porcentaje
                double roundedPercentage = Math.round(totalScore * 1000.0) / 10.0;
                ReportResponse reportResponse = ReportResponse.fromEntity(candidate);
                matches.add(new MatchResponse(reportResponse, roundedPercentage));
            }
        }

        // Ordenar descendente por similitud (score)
        matches.sort((m1, m2) -> Double.compare(m2.getScore(), m1.getScore()));

        return matches;
    }
}
