package com.david.backend.repository;

import com.david.backend.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByCreadorReporteIdOrReclamanteIdOrderByCreatedAtDesc(Long creadorId, Long reclamanteId);

    Optional<ChatRoom> findByReporteIdAndReclamanteId(Long reporteId, Long reclamanteId);

    List<ChatRoom> findByReporteId(Long reporteId);
}
