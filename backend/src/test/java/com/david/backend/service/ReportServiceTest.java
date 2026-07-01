package com.david.backend.service;

import com.david.backend.dto.request.CreateReportRequest;
import com.david.backend.dto.response.ReportResponse;
import com.david.backend.model.*;
import com.david.backend.repository.*;
import com.david.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.jpa.domain.Specification;
import org.mockito.ArgumentMatchers;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReporteRepository reporteRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ImagenReporteRepository imagenReporteRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private ReportService reportService;

    private Usuario testUser;
    private Categoria testCategory;
    private Reporte testReport;

    @BeforeEach
    void setUp() {
        testUser = Usuario.builder()
                .id(1L)
                .nombreCompleto("David Perez")
                .correo("david@unsch.edu.pe")
                .build();

        testCategory = Categoria.builder()
                .id(1L)
                .nombre("Electrónica")
                .icono("smartphone")
                .build();

        testReport = Reporte.builder()
                .id(10L)
                .usuario(testUser)
                .categoria(testCategory)
                .tipo("PERDIDO")
                .nombreObjeto("iPhone 13")
                .descripcion("Color negro, pantalla rota")
                .lugar("Pabellón B")
                .fechaIncidente(LocalDate.now())
                .imagenes(new ArrayList<>())
                .build();
    }

    @Test
    void createReport_Success() {
        CreateReportRequest request = new CreateReportRequest();
        request.setCategoriaId(1L);
        request.setTipo("PERDIDO");
        request.setNombreObjeto("iPhone 13");
        request.setDescripcion("Color negro, pantalla rota");
        request.setLugar("Pabellón B");
        request.setFechaIncidente(LocalDate.now());

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(reporteRepository.save(any(Reporte.class))).thenReturn(testReport);

        ReportResponse response = reportService.createReport(testUser, request);

        assertNotNull(response);
        assertEquals("iPhone 13", response.getNombreObjeto());
        assertEquals("Electrónica", response.getCategoriaNombre());
        verify(reporteRepository).save(any(Reporte.class));
    }

    @Test
    void createReport_InvalidTipo_ThrowsException() {
        CreateReportRequest request = new CreateReportRequest();
        request.setCategoriaId(1L);
        request.setTipo("INVALID_TIPO");

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        assertThrows(RuntimeException.class, () -> reportService.createReport(testUser, request));
    }

    @Test
    void uploadImages_Success() throws IOException {
        MockMultipartFile file1 = new MockMultipartFile("files", "pic1.jpg", "image/jpeg", "content".getBytes());
        List<MultipartFile> files = List.of(file1);

        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));
        when(imagenReporteRepository.countByReporteId(10L)).thenReturn(0L);
        when(cloudinaryService.uploadImage(file1, "lostcampus/reports")).thenReturn(Map.of(
                "secure_url", "http://cloudinary.com/pic1.jpg",
                "public_id", "pic1_public_id"));
        when(imagenReporteRepository.save(any(ImagenReporte.class))).thenReturn(new ImagenReporte());

        ReportResponse response = reportService.uploadImages(testUser, 10L, files);

        assertNotNull(response);
        verify(imagenReporteRepository).save(any(ImagenReporte.class));
        assertEquals(1, testReport.getImagenes().size());
    }

    @Test
    void uploadImages_TooManyImages_ThrowsException() {
        MockMultipartFile file1 = new MockMultipartFile("files", "pic.jpg", "image/jpeg", "content".getBytes());
        List<MultipartFile> files = List.of(file1);

        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));
        // Ya tiene 3 imágenes
        when(imagenReporteRepository.countByReporteId(10L)).thenReturn(3L);

        assertThrows(RuntimeException.class, () -> reportService.uploadImages(testUser, 10L, files));
    }

    @Test
    void deleteReport_Success() throws IOException {
        ImagenReporte img = ImagenReporte.builder()
                .id(1L)
                .publicIdCloudinary("img_id")
                .urlCloudinary("url")
                .build();
        testReport.getImagenes().add(img);

        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));

        reportService.deleteReport(testUser, 10L);

        verify(cloudinaryService).deleteImage("img_id");
        verify(reporteRepository).delete(testReport);
    }

    @Test
    void deleteReport_UnauthorizedUser_ThrowsException() {
        Usuario anotherUser = Usuario.builder().id(99L).nombreCompleto("Otro").build();

        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));

        assertThrows(RuntimeException.class, () -> reportService.deleteReport(anotherUser, 10L));
        verify(reporteRepository, never()).delete(any(Reporte.class));
    }

    @SuppressWarnings("unchecked")
    @Test
    void getReports_SearchQuery() {
        Page<Reporte> page = new PageImpl<>(List.of(testReport));

        when(reporteRepository.findAll(ArgumentMatchers.<Specification<Reporte>>any(), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        Page<ReportResponse> result = reportService.getReports("iPhone", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("iPhone 13", result.getContent().get(0).getNombreObjeto());
    }

    @Test
    void getReports_WithFilters_Success() {
        List<Long> categories = List.of(1L, 2L);
        LocalDate start = LocalDate.now().minusDays(5);
        LocalDate end = LocalDate.now();
        Page<Reporte> page = new PageImpl<>(List.of(testReport));

        when(reporteRepository.findAll(ArgumentMatchers.<Specification<Reporte>>any(), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        Page<ReportResponse> result = reportService.getReports("iPhone", categories, "PERDIDO", "Pabellón B", start,
                end, 0, 10, "desc");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getReports_InvalidDateRange_ThrowsException() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().minusDays(1); // Fecha de inicio posterior a fin

        assertThrows(RuntimeException.class, () -> reportService.getReports(
                null, null, null, null, start, end, 0, 10, "desc"));
    }

    @SuppressWarnings("unchecked")
    @Test
    void getReports_SortingAscending_Success() {
        Page<Reporte> page = new PageImpl<>(List.of(testReport));

        when(reporteRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        Page<ReportResponse> result = reportService.getReports(null, null, null, null, null, null, 0, 10, "asc");

        assertNotNull(result);
        verify(reporteRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class));
    }

    @Test
    void getReportById_Success() {
        when(reporteRepository.findById(10L)).thenReturn(Optional.of(testReport));

        ReportResponse response = reportService.getReportById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("iPhone 13", response.getNombreObjeto());
    }

    @Test
    void getReportById_NotFound_ThrowsException() {
        when(reporteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reportService.getReportById(999L));
    }
}
