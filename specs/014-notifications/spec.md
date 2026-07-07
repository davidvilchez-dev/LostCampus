# Feature Specification: Sistema de Notificaciones en Tiempo Real y Persistencia (HU-26)

**Feature Branch**: `014-notifications`

**Created**: 2026-07-05

**Status**: Completado

**Input**: User description: "Implement real-time and persistent notifications system (HU-26)"

---

## User Scenarios & Testing

### User Story 1 - Persistencia y campana de notificaciones (HU-26) (Priority: P1)

Como usuario autenticado, quiero ver un ícono de campana en la barra de navegación con un contador visual de notificaciones no leídas y poder abrir un menú desplegable para consultar las notificaciones recientes y marcarlas como leídas, para llevar un control de los eventos importantes relacionados a mis reportes.

**Why this priority**: Es la interfaz de usuario principal que permite interactuar con el historial de notificaciones y gestionar su estado de lectura.

**Independent Test**:

1. Iniciar sesión como Usuario A.
2. Hacer clic en el ícono de la campana en la barra de navegación.
3. Verificar que se despliega un panel flotante mostrando la lista de notificaciones recientes.
4. Hacer clic en una notificación no leída; comprobar que se marca como leída (el contador del badge disminuye), y se redirige a la página de destino.
5. Hacer clic en el botón "Marcar todas como leídas" y confirmar que el badge numérico desaparece.

**Acceptance Scenarios**:

1. **Given** que el usuario autenticado tiene notificaciones con `leido = false`, **When** renderiza cualquier página con el Navbar, **Then** el ícono de la campana muestra un círculo rojo con el número total de notificaciones no leídas.
2. **Given** que el usuario hace clic en el botón "Marcar todas como leídas", **When** se envía la petición, **Then** el servidor actualiza todos los registros del usuario a `leido = true` y el badge en el Navbar desaparece.
3. **Given** que el usuario hace clic en una notificación individual, **When** es redirigido a su `enlace`, **Then** se envía una petición al backend para actualizar esa notificación específica a `leido = true`.

---

### User Story 2 - Notificaciones en tiempo real vía WebSocket (HU-26) (Priority: P1)

Como usuario conectado a la plataforma, quiero recibir notificaciones push en tiempo real de forma inmediata cuando ocurra algún evento, sin necesidad de actualizar manualmente el navegador.

**Why this priority**: Mejora radicalmente la experiencia de usuario y asegura que se enteren de interacciones críticas (mensajes o reclamos) al instante.

**Independent Test**:

1. El Usuario A (dueño del reporte) y el Usuario B (reclamante) inician sesión en distintos navegadores.
2. El Usuario B envía una solicitud de reclamación al reporte del Usuario A.
3. Verificar que en la pantalla del Usuario A aparece un mensaje flotante (Toast notification) y el número de la campana se incrementa en +1 al instante.

**Acceptance Scenarios**:

1. **Given** que el usuario está conectado a la plataforma y suscrito al canal WebSocket `/topic/notifications/{userId}`, **When** se crea una nueva notificación en la base de datos para él, **Then** el servidor publica el DTO de la notificación en ese canal.
2. **Given** que el cliente recibe el mensaje WebSocket en el canal de notificaciones, **When** lo procesa, **Then** se incrementa el contador de la campana en el Navbar y se dispara una alerta flotante de tipo Toast.

---

### User Story 3 - Disparadores de notificación por eventos de negocio (HU-26) (Priority: P1)

Como usuario de LostCampus, quiero que el sistema me notifique automáticamente por reclamos recibidos, reclamos aceptados/rechazados, y nuevos mensajes de chat.

**Why this priority**: Conecta las funcionalidades del Sprint 2 y Sprint 3 de manera coherente, eliminando la necesidad de revisar constantemente cada pantalla.

**Independent Test**:

1. El Usuario A reporta una "Laptop encontrada".
2. El Usuario B reclama la laptop. Verificar que el Usuario A recibe una notificación: _"Nueva solicitud de reclamación recibida para tu reporte 'Laptop encontrada'"_.
3. El Usuario A acepta el reclamo. Verificar que el Usuario B recibe una notificación: _"Tu solicitud de reclamación para 'Laptop encontrada' ha sido aceptada"_.
4. El Usuario A envía un mensaje de chat al Usuario B. Si el Usuario B está en la página de feed, verificar que recibe una notificación: _"Nuevo mensaje de David Perez: [contenido]"_. Si el Usuario B está dentro de la misma pantalla de chat de esa conversación, verificar que no se le genera notificación.

**Acceptance Scenarios**:

1. **Given** un evento de creación de reclamación en `SolicitudReclamacionService.enviarSolicitud`, **When** se guarda la solicitud con éxito, **Then** se crea y transmite una notificación para el dueño de la publicación.
2. **Given** un evento de aceptación de reclamación en `SolicitudReclamacionService.aceptarSolicitud`, **When** se actualiza el estado del reporte a `EN_PROCESO`, **Then** se crea y transmite una notificación para el reclamante.
3. **Given** un evento de rechazo de reclamación en `SolicitudReclamacionService.rechazarSolicitud`, **When** se guarda el rechazo, **Then** se crea y transmite una notificación para el reclamante.
4. **Given** la llegada de un nuevo mensaje en `ChatService.sendMessage`, **When** el receptor no está visualizando activamente ese chat en el frontend, **Then** se crea y transmite una notificación de tipo chat para él.

---

## Edge Cases

- **Usuario desconectado (Offline)**: Si el usuario recibe notificaciones mientras no está conectado en la plataforma, estas deben guardarse en la BD en estado no leído (`leido = false`) y presentarse inmediatamente en el badge y campana la próxima vez que inicie sesión.
- **Evitar auto-notificaciones de chat**: Un usuario nunca debe recibir notificaciones de mensajes que él mismo envió.
- **Evitar notificaciones duplicadas en el chat activo**: Si el destinatario ya está con la ventana del chat abierta y activa en el navegador correspondiente a esa conversación, no se debe generar una notificación persistente de mensaje para evitar ruido en la BD.
- **Fallos en la conexión de WebSocket**: Si el cliente WebSocket pierde la conexión, el frontend debe reintentar la conexión automáticamente. Mientras esté desconectado, las llamadas de red regulares del Navbar (ej. polling inicial) servirán como respaldo para cargar las notificaciones.

---

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer la entidad `Notificacion` con campos `id`, `usuario` (destinatario), `titulo` (String), `mensaje` (String), `tipo` (Enum/String: RECLAMO_RECIBIDO, RECLAMO_ACEPTADO, RECLAMO_RECHAZADO, CHAT_MENSAJE), `leido` (Boolean), `enlace` (String redirección), y `createdAt` (LocalDateTime).
- **FR-002**: El backend debe proveer los siguientes endpoints REST:
  - `GET /api/notificaciones`: Retorna la lista de las últimas 15 notificaciones del usuario autenticado.
  - `GET /api/notificaciones/unread-count`: Retorna el conteo de notificaciones no leídas.
  - `PATCH /api/notificaciones/{id}/read`: Marca una notificación individual como leída.
  - `PATCH /api/notificaciones/read-all`: Marca todas las notificaciones del usuario autenticado como leídas de manera masiva.
- **FR-003**: El backend debe utilizar `SimpMessagingTemplate` de Spring WebSocket para publicar eventos de notificación a `/topic/notifications/{userId}` al momento de crearse una notificación en la base de datos.
- **FR-004**: El frontend debe agregar el componente `NotificationBell` en la barra de navegación superior. Debe conectarse al WebSocket al iniciar sesión y escuchar suscripciones en `/topic/notifications/{userId}` para actualizar el estado del badge y mostrar Toasts.

### Key Entities

- **Notificacion**:
  - `id` (Long, PK)
  - `usuario` (Usuario, FK, destinatario)
  - `titulo` (String)
  - `mensaje` (String)
  - `tipo` (String)
  - `leido` (Boolean)
  - `enlace` (String)
  - `createdAt` (LocalDateTime)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Cobertura de pruebas unitarias superior al **95%** en `NotificationService`.
- **SC-002**: Cobertura de pruebas de integración con `MockMvc` superior al **95%** en `NotificationController`.
- **SC-003**: El retardo entre la persistencia del evento desencadenante (ej. enviar reclamo) y la recepción de la notificación WebSocket en el frontend debe ser inferior a 150ms.
- **SC-004**: Los correos electrónicos simulados (logs de consola) deben generarse para eventos clave de reclamación para simular el envío de emails.

---

## Assumptions

- **A-001**: El interceptor de seguridad de WebSockets existente (`WebSocketConfig`) que extrae el token JWT autenticará de forma segura las conexiones y permitirá suscribirse de forma exclusiva a `/topic/notifications/{userId}` basándose en el usuario autenticado del token.
