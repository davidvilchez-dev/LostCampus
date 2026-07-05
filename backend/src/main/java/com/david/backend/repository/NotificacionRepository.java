package com.david.backend.repository;

import com.david.backend.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    long countByUsuarioIdAndLeidoFalse(Long usuarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leido = true WHERE n.usuario.id = :usuarioId AND n.leido = false")
    void markAllAsReadByUsuarioId(@Param("usuarioId") Long usuarioId);
}
