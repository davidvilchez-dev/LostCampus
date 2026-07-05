package com.david.backend.repository;

import com.david.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);

    java.util.Optional<ChatMessage> findFirstByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);

    void deleteByChatRoomId(Long chatRoomId);
}
