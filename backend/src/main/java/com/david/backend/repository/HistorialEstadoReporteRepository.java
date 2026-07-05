package com.david.backend.repository;

import com.david.backend.model.HistorialEstadoReporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialEstadoReporteRepository extends JpaRepository<HistorialEstadoReporte, Long> {
    List<HistorialEstadoReporte> findByReporteIdOrderByFechaCambioDesc(Long reporteId);
}
