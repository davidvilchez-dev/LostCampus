# Tasks - Chat Privado y Gestión de Estados

- [x] **Configuración e Infraestructura**
  - [x] Agregar la dependencia `spring-boot-starter-websocket` en `pom.xml`.
  - [x] Crear la clase `WebSocketConfig` y configurar el broker de mensajería STOMP con interceptores para JWT.
  - [x] Actualizar `SecurityConfig` para permitir accesos a `/ws-chat/**`.

- [x] **Modelo de Datos y Repositorios**
  - [x] Crear la entidad `ChatRoom` en `com.david.backend.model`.
  - [x] Crear la entidad `ChatMessage` en `com.david.backend.model`.
  - [x] Crear el repositorio `ChatRoomRepository`.
  - [x] Crear el repositorio `ChatMessageRepository`.

- [x] **DTOs y Controladores**
  - [x] Crear los DTOs de respuesta y petición para el Chat.
  - [x] Crear el controlador REST `ChatController`.
  - [x] Crear el controlador WebSocket `ChatWebSocketController`.

- [x] **Servicios y Lógica de Negocio**
  - [x] Implementar `ChatService` con métodos para crear salas, listar salas, ver mensajes, enviar mensajes y confirmar entrega.
  - [x] Modificar `SolicitudReclamacionService` para cambiar el estado del reporte a `EN_PROCESO` al aceptar una solicitud y crear el `ChatRoom`.

- [x] **Pruebas y Verificación Backend**
  - [x] Crear pruebas unitarias para `ChatService` (`ChatServiceTest.java`).
  - [x] Crear pruebas de integración para `ChatController` (`ChatControllerIntegrationTest.java`).
  - [x] Asegurar cobertura JaCoCo superior al 95%.

- [x] **Frontend**
  - [x] Agregar la ruta `/mensajes` en `App.tsx`.
  - [x] Crear el componente `MessagesPage.tsx` con listado de conversaciones y ventana de chat en tiempo real.
  - [x] Integrar el cliente STOMP/SockJS en `MessagesPage.tsx`.
  - [x] Implementar la cabecera de chat con datos del reporte y botón "Confirmar entrega" condicional.
  - [x] Modificar `ClaimsPage.tsx` para redirigir a `/mensajes` al aceptar una solicitud.
  - [x] Modificar `ReportDetailPage.tsx` para mostrar los badges de estado correctamente.
