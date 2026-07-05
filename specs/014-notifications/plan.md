# Plan de Implementación: Sistema de Notificaciones en Tiempo Real y Persistencia (HU-26)

**Historias de Usuario**:
- `HU-26` Sistema de notificaciones en tiempo real y persistencia en campana de notificaciones

**Rama de Git**: `014-notifications`

---

## 1. Objetivo

Implementar un sistema de notificaciones unificado y reactivo en LostCampus. Permitirá a los usuarios recibir alertas visuales instantáneas (Toasts) y persistentes (en un menú de campana en el Navbar) ante eventos críticos: recibir solicitudes de reclamación, aprobación/rechazo de reclamos, y nuevos mensajes de chat. Se integrará con el broker WebSocket STOMP existente y persistirá el historial de notificaciones en la base de datos PostgreSQL.

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── dto/
│   │   └── response/
│   │       └── NotificationResponse.java    <-- [NEW] DTO para las notificaciones enviadas al cliente
│   ├── model/
│   │   └── Notificacion.java                <-- [NEW] Entidad JPA de notificaciones
│   ├── repository/
│   │   └── NotificacionRepository.java      <-- [NEW] Repositorio JPA para consultas y actualizaciones masivas
│   ├── service/
│   │   ├── NotificationService.java         <-- [NEW] Creación, envío WebSocket y persistencia de notificaciones
│   │   ├── ChatService.java                 <-- [MODIFICAR] Disparar notificación de mensaje con detección de chat activo
│   │   └── SolicitudReclamacionService.java <-- [MODIFICAR] Disparar notificaciones de reclamos (recibidos, aceptados, rechazados)
│   ├── event/
│   │   └── WebSocketSubscriptionListener.java <-- [NEW] Listener de eventos WebSocket para rastrear visualización activa del chat
│   └── controller/
│       └── NotificationController.java      <-- [NEW] Endpoints REST para gestionar notificaciones
└── src/test/java/com/david/backend/
    ├── service/
    │   └── NotificationServiceTest.java     <-- [NEW] Pruebas unitarias del servicio de notificaciones
    └── controller/
        └── NotificationControllerIntegrationTest.java <-- [NEW] Pruebas de integración del controlador REST

frontend/
├── src/
│   ├── api/
│   │   └── notificationService.ts           <-- [NEW] Cliente de API para notificaciones
│   ├── components/
│   │   ├── DashboardLayout.tsx              <-- [MODIFICAR] Configurar suscripción WebSocket global y recibir notificaciones
│   │   └── NotificationBell.tsx             <-- [NEW] Icono de campana con badge y dropdown interactivo
│   └── index.css                            <-- [MODIFICAR] Estilos personalizados para el panel de notificaciones y badge
```

---

## 3. Detalle de Cambios

### Backend (Spring Boot)

#### [NEW] `Notificacion.java`
- Entidad con campos: `id`, `usuario` (ManyToOne a `Usuario`), `titulo` (String), `mensaje` (String), `tipo` (String), `leido` (Boolean, default false), `enlace` (String redirección, ej. `/solicitudes`), y `createdAt` (LocalDateTime).

#### [NEW] `NotificacionRepository.java`
- Métodos:
  - `findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId)`: Para listar el historial.
  - `countByUsuarioIdAndLeidoFalse(Long usuarioId)`: Para el conteo del badge.
  - `@Modifying @Query`: `update Notificacion n set n.leido = true where n.usuario.id = :usuarioId` para el marcado masivo rápido.

#### [NEW] `NotificationResponse.java`
- DTO de respuesta con mapeo desde la entidad `Notificacion`, formateando la fecha a ISO-8601 o relativo.

#### [NEW] `NotificationService.java`
- `crearNotificacion(Usuario destinatario, String titulo, String mensaje, String tipo, String enlace)`:
  - Guarda la notificación en la BD.
  - Envía la notificación en tiempo real usando `SimpMessagingTemplate` a `/topic/notifications/{destinatarioId}`.
  - Genera un log en consola simulando el envío de correo institucional.
- `getNotificaciones(Usuario usuario)`: Devuelve las últimas 15 notificaciones.
- `getUnreadCount(Usuario usuario)`: Devuelve la cantidad de no leídas.
- `markAsRead(Usuario usuario, Long id)`: Marca una notificación como leída si pertenece al usuario.
- `markAllAsRead(Usuario usuario)`: Marca todas como leídas de forma masiva en una sola transacción.

#### [NEW] `WebSocketSubscriptionListener.java`
- Escucha los eventos de Spring `@EventListener SessionSubscribeEvent` y `SessionUnsubscribeEvent`.
- Extrae el ID del usuario y el destino de suscripción (ej: `/topic/chat/{roomId}`).
- Mantiene un mapa concurrente en memoria `activeChatSessions` que asocia `usuarioId -> roomId`. Esto permite a `ChatService` saber si el destinatario está viendo la conversación activamente en pantalla.

#### [MODIFICAR] `ChatService.java`
- Inyectar `WebSocketSubscriptionListener` y `NotificationService`.
- En `sendMessage`:
  - Obtener el destinatario del mensaje (el otro participante del chat).
  - Verificar si el destinatario está suscrito al chat activo (`activeChatSessions.get(destinatarioId) == roomId`).
  - Si **no** está en el chat activo, llamar a `notificationService.crearNotificacion(...)` con tipo `CHAT_MENSAJE` y enlace `/mensajes`.

#### [MODIFICAR] `SolicitudReclamacionService.java`
- Inyectar `NotificationService`.
- En `enviarSolicitud`: Disparar notificacion `RECLAMO_RECIBIDO` al dueño del reporte.
- En `aceptarSolicitud`: Disparar notificacion `RECLAMO_ACEPTADO` al reclamante.
- En `rechazarSolicitud`: Disparar notificacion `RECLAMO_RECHAZADO` al reclamante.

#### [NEW] `NotificationController.java`
- Exponer endpoints protegidos por JWT bajo `/api/notificaciones`:
  - `GET /api/notificaciones`
  - `GET /api/notificaciones/unread-count`
  - `PATCH /api/notificaciones/{id}/read`
  - `PATCH /api/notificaciones/read-all`

---

### Frontend (React)

#### [NEW] `notificationService.ts`
- Axios requests para obtener notificaciones, unread-count, marcar como leída y marcar todas como leídas.

#### [NEW] `NotificationBell.tsx`
- Componente interactivo que dibuja una campana elegante con animaciones micro-interactivas.
- Si hay un conteo mayor a 0, dibuja un badge rojo con la cantidad.
- Al hacer clic, abre un menú desplegable (dropdown) premium con diseño de vidrio esmerilado (glassmorphism) que lista las notificaciones.
- Mostrar indicador visual en cada tarjeta (ej. un punto azul para las no leídas).
- Al hacer clic en una notificación:
  - Llama a `markAsRead(id)`.
  - Navega a su enlace (`enlace`).
  - Cierra el menú desplegable.
- Botón "Marcar todas como leídas" en la cabecera del menú.

#### [MODIFICAR] `DashboardLayout.tsx`
- Integrar la suscripción WebSocket:
  - Cuando se establece la conexión WebSocket (STOMP), suscribirse a `/topic/notifications/{usuarioId}`.
  - Al recibir una notificación en tiempo real:
    - Incrementar el contador de no leídas en el Navbar de forma reactiva.
    - Disparar una alerta `toast.info` de `react-toastify` mostrando el título y mensaje.
- Insertar el componente `NotificationBell` en la barra de navegación superior (Navbar).

---

## 4. Plan de Verificación

### Pruebas Unitarias
- `NotificationServiceTest.java`: Verificar creación de notificaciones, persistencia, llamadas a `SimpMessagingTemplate`, conteo y marcado de leídas.

### Pruebas de Integración
- `NotificationControllerIntegrationTest.java`: Probar los endpoints REST mediante `MockMvc` con tokens JWT y verificar las respuestas HTTP y formato JSON.

### Pruebas Manuales
1. Iniciar sesión con el Usuario A en Chrome y con el Usuario B en Firefox (o ventana de incógnito).
2. El Usuario B envía un reclamo al objeto encontrado de A.
3. Verificar que A recibe el Toast de reclamo recibido al instante y el badge de la campana sube a `1`.
4. El Usuario A hace clic en la campana, verifica el listado, presiona en el reclamo y es redirigido a `/solicitudes`.
5. El Usuario A acepta la solicitud. Verificar que B recibe la notificación de aceptación en tiempo real.
6. Enviar mensajes de chat y comprobar que se generan notificaciones de chat solo cuando el receptor no está viendo esa ventana de chat.
