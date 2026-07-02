package com.david.backend.repository;

import com.david.backend.model.EstadoReclamacion;
import com.david.backend.model.SolicitudReclamacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SolicitudReclamacionRepository extends JpaRepository<SolicitudReclamacion, Long> {

    List<SolicitudReclamacion> findByReclamanteIdOrderByCreatedAtDesc(Long reclamanteId);

    List<SolicitudReclamacion> findByReporteUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    boolean existsByReporteIdAndReclamanteIdAndEstadoIn(Long reporteId, Long reclamanteId, Collection<EstadoReclamacion> estados);

    List<SolicitudReclamacion> findByReporteIdAndEstado(Long reporteId, EstadoReclamacion estado);
}
