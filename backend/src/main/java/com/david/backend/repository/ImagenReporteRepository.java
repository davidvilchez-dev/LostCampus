package com.david.backend.repository;

import com.david.backend.model.ImagenReporte;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImagenReporteRepository extends JpaRepository<ImagenReporte, Long> {

    List<ImagenReporte> findByReporteIdOrderByOrdenAsc(Long reporteId);

    long countByReporteId(Long reporteId);
}
