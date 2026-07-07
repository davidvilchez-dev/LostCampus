# Feature Specification: Chat Privado y Gestión de Estados (HU-22, HU-23, HU-24, HU-25, HU-27)

**Feature Branch**: `013-chat-and-states`

**Created**: 2026-07-05

**Status**: Completado

**Input**: User description: "Implement private chat and report state management"

---

## User Scenarios & Testing

### User Story 1 - Apertura automática de chat privado al aceptar una solicitud (HU-22 & HU-27) (Priority: P1)

Como usuario autenticado que reportó un objeto, quiero que se abra una conversación privada automáticamente con el reclamante cuando acepte su solicitud de reclamación, y que el estado del reporte pase automáticamente a `EN_PROCESO`, para poder coordinar los detalles de la entrega de forma segura.

**Why this priority**: Es el disparador inicial que conecta a ambos usuarios en una conversación segura y marca el inicio de la fase de entrega del objeto.

**Independent Test**:

1. Iniciar sesión como Usuario A (que creó un reporte de tipo `ENCONTRADO` en estado `ACTIVO`).
2. Iniciar sesión como Usuario B y enviar una solicitud de reclamación.
3. El Usuario A va a "Solicitudes Recibidas" y hace clic en "Aceptar".
4. Verificar que el estado de la solicitud cambia a `ACEPTADA`, el reporte cambia a `EN_PROCESO`, y se crea un registro de Chat Room accesible para ambos en la pestaña de "Mensajes".

**Acceptance Scenarios**:

1. **Given** que el Usuario A tiene un reporte en estado `ACTIVO` y recibe una solicitud de reclamación en estado `PENDIENTE` del Usuario B, **When** el Usuario A acepta la solicitud, **Then** el sistema cambia transaccionalmente el estado del reporte a `EN_PROCESO`, marca la solicitud como `ACEPTADA`, marca todas las demás solicitudes pendientes para este reporte como `RECHAZADA`, y crea un nuevo Chat Room asociando al Usuario A, al Usuario B y al Reporte.
2. **Given** que el Chat Room ha sido creado exitosamente, **When** el Usuario A o el Usuario B navegan a la sección "Mensajes", **Then** visualizan la nueva conversación en su listado lateral, mostrando el nombre del interlocutor, el avatar, la hora de creación, el nombre y tipo del objeto en el encabezado, y el estado "Pendiente de entrega".

---

### User Story 2 - Enviar y recibir mensajes en tiempo real y persistencia del historial (HU-23 & HU-24) (Priority: P1)

Como usuario en una conversación activa, quiero enviar y recibir mensajes de texto en tiempo real mediante WebSocket y poder ver el historial persistente y ordenado cronológicamente cuando vuelva a ingresar, para mantener una comunicación fluida y transparente.

**Why this priority**: Permite la interacción directa y sincrónica para concretar los detalles del encuentro y entrega física del objeto.

**Independent Test**:

1. El Usuario A y el Usuario B ingresan al mismo Chat Room activo.
2. El Usuario A envía un mensaje de texto.
3. Verificar que el Usuario B recibe el mensaje de forma instantánea sin necesidad de recargar la página.
4. Salir de la pantalla, regresar y verificar que los mensajes persisten en orden cronológico correcto.

**Acceptance Scenarios**:

1. **Given** que un usuario está en la vista del Chat Room activo, **When** escribe un mensaje válido y hace clic en "Enviar", **Then** el mensaje se transmite a través del WebSocket (`/app/chat.sendMessage`) y se guarda en la base de datos de manera persistente con la fecha y hora exacta del servidor.
2. **Given** que ambos usuarios están conectados al chat, **When** se envía un nuevo mensaje, **Then** se recibe en tiempo real a través del topic del WebSocket (`/topic/chat/{roomId}`) y la vista hace scroll automático al final de la conversación.
3. **Given** que el usuario escribe un mensaje vacío o compuesto únicamente por espacios, **When** intenta enviarlo, **Then** el sistema bloquea el envío y muestra un mensaje de advertencia visual sin consumir recursos de red.
4. **Given** que hay un historial previo en la sala de chat, **When** cualquiera de los dos usuarios accede a la conversación, **Then** el sistema carga todos los mensajes en orden cronológico ascendente, diferenciando visualmente los mensajes propios (derecha, fondo azul) de los del interlocutor (izquierda, fondo oscuro/gris), e incluye la fecha y hora en cada burbuja de texto.
5. **Given** que hay mensajes de días distintos, **When** se renderiza el historial, **Then** se introduce una etiqueta separadora central con la fecha correspondiente (ej: "Hoy", "Ayer", o "04 de Julio, 2026").

---

### User Story 3 - Confirmación de entrega del objeto y cierre del caso (HU-25 & HU-27) (Priority: P1)

Como propietario del reporte en una conversación activa, quiero poder confirmar que la entrega del objeto se realizó con éxito para cambiar el estado del reporte a `RECUPERADO` y dejar el chat en modo de solo lectura.

**Why this priority**: Cierra definitivamente el flujo de vida del reporte e indica que el objeto ha retornado con éxito a su dueño legítimo.

**Independent Test**:

1. El propietario del reporte (Usuario A) entra al chat activo y hace clic en el botón "Confirmar entrega" en la cabecera.
2. Confirma la acción en el cuadro de diálogo.
3. Verificar que el reporte pasa a estado `RECUPERADO` en la base de datos, el chat de ambos usuarios se vuelve de solo lectura (deshabilitando el input de envío), y el badge del reporte indica "Recuperado" de forma global.

**Acceptance Scenarios**:

1. **Given** que el usuario autenticado es el creador del reporte vinculado al Chat Room actual, **When** hace clic en "Confirmar entrega", **Then** el sistema muestra una ventana emergente de confirmación.
2. **Given** la confirmación afirmativa del usuario, **When** se ejecuta la acción, **Then** el backend cambia transaccionalmente el estado del reporte a `RECUPERADO`, marca el Chat Room como inactivo/cerrado (`activo = false`), y registra la marca de tiempo de la entrega final.
3. **Given** que el Chat Room se desactiva por confirmación de entrega, **When** cualquiera de los dos participantes ingresa al chat, **Then** el input de entrada de texto queda deshabilitado mostrando el mensaje _"El caso ha sido cerrado. Esta conversación es de solo lectura"_ y el botón de confirmar entrega desaparece del encabezado.

---

## Edge Cases

- **Usuario no autorizado intentando acceder al chat**: Si un usuario intenta acceder a la sala de chat a través de su ID pero no forma parte de los participantes (no es el creador del reporte ni el reclamante aceptado), el backend debe denegar la petición devolviendo un código `403 Forbidden`.
- **Intento de envío de mensajes en un chat cerrado**: Si un usuario intenta enviar un mensaje a través de WebSocket o REST a una sala de chat con `activo = false`, el backend debe rechazar la transacción para evitar la inyección de mensajes en casos resueltos.
- **Cancelación/Rechazo de reclamación**: Si una reclamación aceptada es de alguna manera revertida o cancelada (en caso de que aplique algún flujo administrativo), el reporte debe regresar a estado `ACTIVO` y el chat quedar inhabilitado.
- **Conectividad caída durante el chat en tiempo real**: Si el WebSocket se desconecta, el frontend debe reintentar la conexión de forma automática y permitir el envío mediante fallback HTTP o alertar al usuario del estado offline para evitar pérdida de mensajes en red.

---

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer la entidad `ChatRoom` con relaciones a `Reporte`, `Usuario` (creador del reporte) y `Usuario` (reclamante), un campo booleano `activo` (por defecto true), y `fechaConfirmacionEntrega`.
- **FR-002**: El backend debe exponer la entidad `ChatMessage` con campos `id`, `chatRoom`, `remitente` (Usuario), `contenido` (texto, no nulo), y `createdAt` (LocalDateTime).
- **FR-003**: El backend debe proveer endpoints REST para:
  - `GET /api/chats`: Listar las conversaciones activas e inactivas en las que participa el usuario autenticado (retorna datos clave del interlocutor y del reporte).
  - `GET /api/chats/{id}/mensajes`: Obtener el historial completo de mensajes de un chat, validando que el usuario pertenezca al chat.
  - `POST /api/chats/{id}/confirmar`: Confirmar la entrega y cerrar la conversación.
- **FR-004**: El backend debe configurar la comunicación en tiempo real a través de **Spring WebSocket** con soporte para **STOMP/SockJS**, asegurando que solo los participantes de una sala de chat puedan suscribirse al topic `/topic/chat/{roomId}`.
- **FR-005**: Al aceptar una solicitud de reclamación en `SolicitudReclamacionService`, se debe realizar la transición del estado del reporte a `EN_PROCESO` y gatillar la creación de la sala de chat.
- **FR-006**: El frontend debe contener la vista `/mensajes` que dibuja el listado de chats y la ventana interactiva del chat seleccionado, integrando la librería `@stomp/stompjs` o SockJS para la suscripción al WebSocket.
- **FR-007**: El frontend debe mostrar un botón "Confirmar entrega" en la cabecera de la ventana del chat solo si el usuario autenticado es el propietario del objeto.

### Key Entities

- **ChatRoom**:
  - `id` (Long, PK)
  - `reporte` (Reporte, FK)
  - `creadorReporte` (Usuario, FK)
  - `reclamante` (Usuario, FK)
  - `activo` (Boolean)
  - `fechaConfirmacionEntrega` (LocalDateTime, Nullable)
  - `createdAt` (LocalDateTime)

- **ChatMessage**:
  - `id` (Long, PK)
  - `chatRoom` (ChatRoom, FK)
  - `remitente` (Usuario, FK)
  - `contenido` (String)
  - `createdAt` (LocalDateTime)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Cobertura de pruebas unitarias superior al **95%** en `ChatService` y `ReportService` (actualización de estados).
- **SC-002**: Cobertura de pruebas de integración con `MockMvc` superior al **95%** en `ChatController` y `SolicitudReclamacionController`.
- **SC-003**: Tiempo de entrega e interacción de mensajes mediante WebSocket menor a 100ms bajo condiciones óptimas de red local.
- **SC-004**: Cambio de estado transaccional robusto y atómico: al aceptar la reclamación, la creación de la sala de chat y el paso del reporte a `EN_PROCESO` se deben realizar en un solo bloque transaccional.

---

## Assumptions

- **A-001**: El sistema de autenticación basado en JWT existente se integrará con el handshake de WebSocket para asegurar que los usuarios no autenticados no puedan establecer conexiones.
- **A-002**: Las notificaciones de la historia HU-26 se diseñarán de forma que escuchen los eventos disparados por la creación de chats y mensajes, manteniéndolas desacopladas del flujo base.
