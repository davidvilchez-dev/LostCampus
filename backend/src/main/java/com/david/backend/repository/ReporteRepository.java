package com.david.backend.repository;

import com.david.backend.model.Reporte;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReporteRepository extends JpaRepository<Reporte, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Reporte> {

    List<Reporte> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    Page<Reporte> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM Reporte r WHERE " +
           "LOWER(r.nombreObjeto) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.descripcion) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.categoria.nombre) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY r.createdAt DESC")
    Page<Reporte> buscarPorPalabraClave(@Param("query") String query, Pageable pageable);
}
