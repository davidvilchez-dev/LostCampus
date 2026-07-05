package com.david.backend.repository;

import com.david.backend.model.EstadoReclamacion;
import com.david.backend.model.SolicitudReclamacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SolicitudReclamacionRepository extends JpaRepository<SolicitudReclamacion, Long> {

    List<SolicitudReclamacion> findByReclamanteIdOrderByCreatedAtDesc(Long reclamanteId);

    List<SolicitudReclamacion> findByReporteUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    boolean existsByReporteIdAndReclamanteIdAndEstadoIn(Long reporteId, Long reclamanteId,
            Collection<EstadoReclamacion> estados);

    List<SolicitudReclamacion> findByReporteIdAndEstado(Long reporteId, EstadoReclamacion estado);
}
