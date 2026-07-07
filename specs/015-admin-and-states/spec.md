# Feature Specification: Módulo Administrativo y Gestión de Estados (HU-27, HU-28, HU-29)

**Feature Branch**: `015-admin-and-states`

**Created**: 2026-07-05

**Status**: Completado

**Input**: User stories detailing automatic report state management (HU-27), manual closing of reports by authors (HU-28), and the administration panel with audit logs (HU-29).

---

## User Scenarios & Testing

### User Story 1 - Gestión automática de estados de reportes (HU-27) (Priority: P1)

Como usuario de LostCampus, quiero que el sistema gestione automáticamente los estados de mis reportes a lo largo de su ciclo de vida y mantenga un historial para tener trazabilidad completa.

**Why this priority**: Asegura que el flujo de reportes, reclamos e intercambios mantenga estados coherentes sin requerir intervención manual constante.

**Independent Test**:

1. Crear un reporte y verificar que su estado inicial sea `ACTIVO`.
2. Reclamar el reporte (lo cual crea e inicia el chat, cambiando el estado a `EN_PROCESO`).
3. Rechazar la reclamación (o cancelarla) y verificar que regresa a `ACTIVO`.
4. Confirmar la entrega en el chat y verificar que cambia a `RECUPERADO`.
5. Consultar el historial de cambios de estado y verificar el registro cronológico correcto.

**Acceptance Scenarios**:

1. **Given** que un usuario crea un nuevo reporte, **When** se inserta en base de datos, **Then** el estado inicial asignado es obligatoriamente `ACTIVO`.
2. **Given** que un reporte está `ACTIVO`, **When** se acepta una solicitud de reclamación (o se inicia el chat de reclamo), **Then** el reporte pasa automáticamente a `EN_PROCESO`.
3. **Given** que un reporte está `EN_PROCESO` debido a solicitudes iniciadas, **When** el propietario rechaza o se cancelan todas las solicitudes vinculadas, **Then** el reporte regresa automáticamente a estado `ACTIVO`.
4. **Given** que un reporte está `EN_PROCESO`, **When** el propietario confirma la entrega del objeto, **Then** el reporte pasa a estado `RECUPERADO`.
5. **Given** cualquier cambio de estado en un reporte, **When** ocurre la transición, **Then** el sistema guarda un registro en la tabla de historial de estados con: ID del reporte, estado anterior, estado nuevo, y fecha/hora exacta.

---

### User Story 2 - Cierre manual de reporte (HU-28) (Priority: P2)

Como usuario autenticado que publicó un reporte, quiero poder cerrarlo manualmente si ya no es necesario (por ejemplo, si lo encontré por mis propios medios o ya no deseo buscarlo) para mantener limpio el feed principal.

**Why this priority**: Permite a los usuarios depurar el catálogo de publicaciones activas sin necesidad de ayuda de soporte.

**Independent Test**:

1. Iniciar sesión y entrar al detalle de un reporte propio.
2. Comprobar que aparece el botón "Cerrar reporte".
3. Hacer clic, confirmar en el modal y comprobar que el reporte cambia a `CERRADO`.
4. Verificar que ya no aparece en el feed principal y que las solicitudes pendientes se cancelan de forma automática.

**Acceptance Scenarios**:

1. **Given** que el usuario autenticado es el autor de un reporte en estado `ACTIVO` o `EN_PROCESO`, **When** visita la página de detalle, **Then** visualiza un botón de acción "Cerrar reporte".
2. **Given** que el autor pulsa "Cerrar reporte", **When** se ejecuta la acción, **Then** se le solicita confirmación mediante un modal y, tras aceptar, el backend cambia el estado del reporte a `CERRADO` de forma permanente.
3. **Given** que el reporte se cierra, **When** se finaliza la transacción, **Then** el sistema cancela/rechaza automáticamente todas las solicitudes de reclamación pendientes asociadas a dicho reporte.
4. **Given** un reporte en estado `CERRADO`, **When** un usuario regular intenta interactuar con él, **Then** no se visualiza en el feed principal y no permite realizar nuevas solicitudes de reclamación.
5. **Given** un reporte en estado `CERRADO`, **When** se intenta reactivar, **Then** el sistema restringe esta acción a menos que la realice un administrador.

---

### User Story 3 - Módulo de administración y auditoría (HU-29) (Priority: P1)

Como administrador de la plataforma, quiero acceder a un panel exclusivo para ver todos los reportes, cambiar sus estados o eliminarlos, registrando todas mis acciones en un log de auditoría para mantener el sitio moderado y seguro.

**Why this priority**: Es la herramienta principal para la moderación de contenido y la resolución de incidentes o abusos en la plataforma.

**Independent Test**:

1. Iniciar sesión con una cuenta de administrador (`esAdmin = true`) y verificar la presencia del acceso al "Panel de Administración" en el Navbar/Sidebar.
2. Ingresar al panel, ver la tabla de todos los reportes y filtrar por fecha, estado y tipo.
3. Cambiar el estado de un reporte de un usuario de `ACTIVO` a `CERRADO` y verificar el cambio.
4. Eliminar un reporte de prueba inapropiado y comprobar que ya no existe en el sistema.
5. Consultar los logs de auditoría administrativa y verificar que el log registra al administrador, la acción, el reporte afectado, la fecha y hora.

**Acceptance Scenarios**:

1. **Given** un usuario con rol de administrador (`esAdmin = true`), **When** inicia sesión, **Then** visualiza el enlace de acceso exclusivo a la ruta `/admin` en el menú lateral. Un usuario común que intente entrar directamente a la ruta `/admin` debe ser bloqueado y redirigido.
2. **Given** que el administrador ingresa al panel, **When** se carga la vista, **Then** ve un listado completo de todas las publicaciones del sistema con filtros de búsqueda por estado, tipo (PERDIDO/ENCONTRADO), usuario autor y fecha.
3. **Given** un reporte seleccionado en la vista de administración, **When** el administrador decide cambiar su estado (ej: marcar como `CERRADO` o devolver a `ACTIVO`), **Then** la acción se realiza de forma inmediata y se genera un registro de auditoría.
4. **Given** un reporte inapropiado o reportado, **When** el administrador hace clic en "Eliminar", **Then** el reporte y sus imágenes asociadas se remueven del sistema de forma lógica/física y se guarda en la auditoría con los detalles del motivo y autor de la eliminación.
5. **Given** cualquier acción administrativa realizada (cambio de estado, eliminación), **When** se completa la operación, **Then** se guarda una entrada en la tabla `logs_auditoria_admin` detallando la fecha/hora, el ID del administrador, el tipo de acción y los datos del reporte afectado.

---

## Edge Cases

- **Eliminación de reportes con chats activos**: Si el administrador elimina un reporte que tiene una sala de chat activa, el sistema debe limpiar en cascada los mensajes, la sala de chat y las reclamaciones correspondientes para mantener la base de datos libre de inconsistencias referenciales.
- **Acceso no autorizado al panel administrativo**: Si un token de usuario no administrador intenta acceder a cualquier endpoint REST bajo el contexto `/api/admin/**`, Spring Security debe denegar el acceso devolviendo un código `403 Forbidden`.
- **Intento de reactivación de reportes recuperados**: Un administrador puede reactivar un reporte `CERRADO`, pero si intenta reactivar un reporte en estado `RECUPERADO`, el sistema debe alertar para evitar reactivar objetos que ya fueron devueltos a sus legítimos dueños.

---

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer la entidad `HistorialEstadoReporte` con campos: `id`, `reporte` (FK), `estadoAnterior` (String), `estadoNuevo` (String), y `fechaCambio` (LocalDateTime).
- **FR-002**: El backend debe exponer la entidad `LogAuditoriaAdmin` con campos: `id`, `admin` (Usuario, FK), `accion` (String), `reporteId` (Long), `detalles` (String), y `fechaAccion` (LocalDateTime).
- **FR-003**: El backend debe exponer endpoints protegidos bajo `/api/admin/**` que solo permitan acceso a usuarios con `esAdmin = true`:
  - `GET /api/admin/reportes`: Listar todos los reportes con soporte de filtros.
  - `PUT /api/admin/reportes/{id}/estado`: Cambiar el estado de cualquier reporte.
  - `DELETE /api/admin/reportes/{id}`: Eliminar físicamente/lógicamente un reporte del sistema.
  - `GET /api/admin/auditoria`: Listar logs de auditoría administrativa.
- **FR-004**: Al modificar el estado de cualquier reporte en `ReportService` (ya sea por flujo automático, cierre manual de autor o acción de administrador), se debe gatillar la inserción correspondiente en `HistorialEstadoReporte`.
- **FR-005**: Al cerrar manualmente un reporte en `ReportService`, se deben buscar todas las solicitudes pendientes y marcarlas como `RECHAZADA`.
- **FR-006**: El frontend debe proteger la ruta `/admin` mediante un guard de rutas que verifique que el usuario autenticado tenga el atributo `es_admin: true`.
- **FR-007**: El frontend debe proveer la página `/admin` con una tabla de reportes, controles de filtros, modales de cambio de estado/eliminación y una sección de visualización de bitácora de auditoría.
- **FR-008**: El frontend debe agregar un botón "Cerrar publicación" en la vista `/reporte/:id` visible únicamente para el creador si el reporte no está ya cerrado o recuperado.

### Key Entities

- **HistorialEstadoReporte**:
  - `id` (Long, PK)
  - `reporte` (Reporte, FK)
  - `estadoAnterior` (String)
  - `estadoNuevo` (String)
  - `fechaCambio` (LocalDateTime)

- **LogAuditoriaAdmin**:
  - `id` (Long, PK)
  - `admin` (Usuario, FK)
  - `accion` (String)
  - `reporteId` (Long)
  - `detalles` (String)
  - `fechaAccion` (LocalDateTime)
