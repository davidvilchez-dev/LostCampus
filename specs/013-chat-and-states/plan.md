# Implementation Plan: Chat Privado y Gestión de Estados (Sprint 3, Bloque 1)

**Branch**: `013-chat-and-states` | **Date**: 2026-07-05 | **Spec**: [spec.md](file:///c:/LABORATORIO/LostCampus/specs/013-chat-and-states/spec.md)

**Input**: Feature specification from `/specs/013-chat-and-states/spec.md`

---

## Summary

This feature implements a private, secure chat room module allowing real-time message exchange between users (object owners and claimants) once a claim request is accepted. It also automates report status transitions across the lifecycle: `ACTIVO` -> `EN_PROCESO` (when accepted) -> `RECUPERADO` (when delivery confirmed).

Technical approach:
- **WebSockets**: Configured in Spring Boot using STOMP broker. Message security is validated via a custom channel interceptor using JWT.
- **REST APIs**: Endpoints to list conversations, retrieve historical messages, and trigger delivery confirmation.
- **Database**: Two new tables: `chat_rooms` and `chat_messages` in PostgreSQL.
- **Transactional flow**: Atomic operations on `SolicitudReclamacionService` for accepting requests (update claim, update report state, create chat room).

---

## Technical Context

**Language/Version**: Java 25, React 19, TypeScript

**Primary Dependencies**:
- Backend: `spring-boot-starter-websocket`
- Frontend: `@stomp/stompjs`

**Storage**: PostgreSQL 16 (new entities `ChatRoom` and `ChatMessage`, schema updates to `reportes` and `solicitudes_reclamacion`).

**Testing**: JUnit 5, Mockito, Spring Boot Test (`MockMvc` for REST endpoints, `WebSocketStompClient` for WebSockets).

**Target Platform**: Web browsers (Chrome, Firefox, Edge, Safari).

**Project Type**: Web application (Spring Boot + React).

---

## Constitution Check

- [x] **I. Decoupled Architecture**: Maintained. React frontend communicates with Spring Boot backend via REST APIs and WebSockets.
- [x] **II. Service Testing Rigor**: JUnit 5 and Mockito unit tests will cover 100% of business logic in `ChatService`.
- [x] **III. Quality Gates**: Minimum 95% line coverage will be achieved for all new/modified classes.
- [x] **IV. REST Integration Testing**: Integration tests using `MockMvc` will verify `ChatController` and status transition endpoints.
- [x] **V. Cloud-Native Storage**: N/A (no new image uploads in this chat feature; existing Cloudinary config remains).
- [x] **VI. Security-First Auth**: Chat room endpoints are protected by JWT, and WebSocket connections authenticate the JWT in STOMP headers.
- [x] **Agile/SDD**: Scoped and planned for Sprint 3.

---

## Project Structure

### Documentation

```text
specs/013-chat-and-states/
├── spec.md              # Feature Specification (Draft completed)
├── plan.md              # This file (Implementation Plan)
└── tasks.md             # Task checklist (To be generated)
```

### Proposed Source Code Changes

#### Backend

##### [MODIFY] [pom.xml](file:///c:/LABORATORIO/LostCampus/backend/pom.xml)
- Add dependency: `org.springframework.boot:spring-boot-starter-websocket`.

##### [NEW] [WebSocketConfig.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/config/WebSocketConfig.java)
- Configures `/ws-chat` endpoint with SockJS fallback.
- Enables `/topic` and `/app` message brokers.
- Registers a `ChannelInterceptor` to extract JWT from CONNECT headers and authenticate the WebSocket session.

##### [MODIFY] [SecurityConfig.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/security/SecurityConfig.java)
- Add `/ws-chat/**` to permitted paths to allow HTTP WebSocket handshake.

##### [NEW] [ChatRoom.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/model/ChatRoom.java)
- Entity representing a chat conversation. Fields: `id`, `reporte` (ManyToOne), `creadorReporte` (ManyToOne Usuario), `reclamante` (ManyToOne Usuario), `activo` (Boolean), `fechaConfirmacionEntrega` (LocalDateTime), `createdAt` (LocalDateTime).

##### [NEW] [ChatMessage.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/model/ChatMessage.java)
- Entity representing a message. Fields: `id`, `chatRoom` (ManyToOne), `remitente` (ManyToOne Usuario), `contenido` (String), `createdAt` (LocalDateTime).

##### [NEW] [ChatRoomRepository.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/repository/ChatRoomRepository.java)
- Queries to find rooms where the user is either `creadorReporte` or `reclamante`.
- Query to find a room by report ID and claimant.

##### [NEW] [ChatMessageRepository.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/repository/ChatMessageRepository.java)
- Queries to retrieve messages of a room ordered by `createdAt` ascending.

##### [NEW] [ChatRoomResponse.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/dto/response/ChatRoomResponse.java)
- DTO containing chat room details, other participant info, report details, and latest message metadata.

##### [NEW] [ChatMessageResponse.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/dto/response/ChatMessageResponse.java)
- DTO containing message details (id, content, sender name/id, createdAt).

##### [NEW] [SendChatMessageRequest.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/dto/request/SendChatMessageRequest.java)
- DTO for sending a chat message. Fields: `contenido` (validated not blank).

##### [NEW] [ChatService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/ChatService.java)
- `createChatRoom(Reporte reporte, Usuario creador, Usuario reclamante)`: Creates room.
- `getRoomsForUser(Usuario usuario)`: Fetches chat rooms.
- `getRoomMessages(Usuario usuario, Long roomId)`: Validates membership and returns history.
- `sendMessage(Usuario usuario, Long roomId, SendChatMessageRequest request)`: Adds message and triggers WebSocket push.
- `confirmDelivery(Usuario usuario, Long roomId)`: Updates report to `RECUPERADO`, sets `activo = false` on room.

##### [MODIFY] [SolicitudReclamacionService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/SolicitudReclamacionService.java)
- In the `aceptarSolicitud` method:
  - Transition the report state to `EN_PROCESO` (instead of `CERRADO`).
  - Invoke `chatService.createChatRoom(reporte, reporte.getUsuario(), solicitud.getReclamante())`.

##### [NEW] [ChatController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/ChatController.java)
- REST endpoints:
  - `GET /api/chats` (lists rooms).
  - `GET /api/chats/{id}/mensajes` (history).
  - `POST /api/chats/{id}/confirmar` (confirm delivery).

##### [NEW] [ChatWebSocketController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/ChatWebSocketController.java)
- WebSocket controller:
  - Handles `/app/chat.sendMessage` destinations and broadcasts to `/topic/chat/{roomId}`.

---

#### Frontend

##### [MODIFY] [App.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/App.tsx)
- Register route `/mensajes` for the private chat screen.

##### [NEW] [MessagesPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/MessagesPage.tsx)
- Recreates the provided UI:
  - Left pane: Sidebar (inherited navigation).
  - Center pane: List of conversations (with avatars, last message, names).
  - Right pane: Active chat panel (header with report info and "Confirmar entrega" button, chronological bubble history with date separators, message input bar with attachment, validation, and auto-scroll).
- Integrates `@stomp/stompjs` client for WebSocket subscriptions.

##### [MODIFY] [ClaimsPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/ClaimsPage.tsx)
- Update claim actions. Accepting a claim transitions the UI state correctly and alerts the user that a chat has opened.

##### [MODIFY] [ReportDetailPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/ReportDetailPage.tsx)
- Show "En Proceso" / "Recuperado" badge and handle layout states.

---

## Verification Plan

### Automated Tests

- **Unit Tests**:
  - `ChatServiceTest.java`: Verify chat room creation, room retrieval, message persistence, access validation, and delivery confirmation logic.
  - `ReporteEstadoTest.java`: Verify correct state transitions on `Reporte` entity.
- **Integration Tests**:
  - `ChatControllerIntegrationTest.java`: Test REST endpoints (`/api/chats`, `/api/chats/{id}/mensajes`, `/api/chats/{id}/confirmar`) with security validations.
- **JaCoCo Command**:
  - `mvnw clean verify` to ensure line coverage exceeds 95% on all new classes.

### Manual Verification

1. **Authentication**: Register/login with User A and User B.
2. **Setup**: User A creates an "Encontrado" report. User B sends a claim request.
3. **Acceptance**: User A accepts the claim request.
4. **State Transition**: Verify report state becomes `EN_PROCESO` and a `ChatRoom` is created.
5. **Chat Interaction**:
   - Both User A and User B navigate to `/mensajes`.
   - Send messages in real-time. Verify message arrival without page refresh.
   - Verify scroll to bottom and date separators.
6. **Delivery Confirmation**:
   - User A (owner) clicks "Confirmar entrega".
   - Verify report state transitions to `RECUPERADO` globally.
   - Verify both users see the chat disabled (read-only) and input deselects.
