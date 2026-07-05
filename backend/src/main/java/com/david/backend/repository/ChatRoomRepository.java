package com.david.backend.repository;

import com.david.backend.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByCreadorReporteIdOrReclamanteIdOrderByCreatedAtDesc(Long creadorId, Long reclamanteId);

    Optional<ChatRoom> findByReporteIdAndReclamanteId(Long reporteId, Long reclamanteId);
}
