# Feature Specification: Listar y marcar reportes como recuperados (HU-15 y HU-16)

**Feature Branch**: `010-my-reports-resolve`

**Created**: 2026-07-01

**Status**: Completado

**Input**: User description: "Listar mis reportes (HU-15) y marcar reportes como recuperados (HU-16) en un solo flujo."

## User Scenarios & Testing

### User Story 1 - Listado de mis reportes (HU-15) (Priority: P1)

Como usuario, quiero ver una pantalla privada con todas las publicaciones de objetos que he reportado (perdidos o encontrados) para poder realizar un seguimiento y administrarlos cómodamente.

**Why this priority**: Es el panel de control necesario para que el usuario gestione sus reportes, vea su estado y realice ediciones o eliminaciones.

**Independent Test**: Ir a la barra lateral o al menú, hacer clic en "Mis Reportes" y verificar que carguen exclusivamente las publicaciones creadas por la cuenta activa actual.

**Acceptance Scenarios**:

1. **Given** que el usuario ha iniciado sesión y tiene reportes creados, **When** accede a la vista `/mis-reportes`, **Then** el sistema muestra una cuadrícula con todas sus publicaciones organizadas por fecha de creación (de más reciente a más antigua).
2. **Given** que cada tarjeta en el listado muestra el objeto, categoría, lugar, fecha e imagen de portada, **When** se renderiza, **Then** incluye un badge distintivo del estado actual (`Activo` en azul, `Coincidencia Detectada` en naranja, `Cerrado` en gris).
3. **Given** que el usuario es nuevo y no tiene reportes creados, **When** accede a `/mis-reportes`, **Then** visualiza un diseño de estado vacío ("Sin reportes registrados") con un botón directo para reportar su primer objeto.

---

### User Story 2 - Marcar reporte como recuperado (HU-16) (Priority: P1)

Como usuario, quiero poder marcar un objeto reportado como recuperado/resuelto cuando haya regresado a su dueño, cerrando la publicación de manera persistente.

**Why this priority**: Es la conclusión natural del ciclo de vida de un objeto perdido y evita que la comunidad siga buscando o reclamando objetos que ya fueron entregados.

**Independent Test**: Hacer clic en el botón de confirmación (icono check) en una de las tarjetas de reportes activos en "Mis Reportes", verificar el cambio visual en la UI a "Cerrado" y comprobar que en el feed global se visualiza con el badge de "Recuperado".

**Acceptance Scenarios**:

1. **Given** que el usuario es autor de un reporte activo, **When** hace clic en el botón de marcar como resuelto (icono check), **Then** el sistema le pide confirmación, envía la petición al backend y cambia el estado del reporte a `CERRADO` persistiendo en la base de datos.
2. **Given** que el reporte se marca exitosamente como `CERRADO`, **When** se recarga o se consulta el feed global, **Then** el reporte muestra claramente una etiqueta verde de éxito ("Recuperado").
3. **Given** que un reporte se encuentra `CERRADO`, **When** se visualiza su detalle o tarjeta, **Then** se deshabilitan las opciones de edición y no se permiten abrir más coincidencias o reclamos.

---

## Edge Cases

- **Intento de resolver un reporte ya cerrado**: Si el reporte ya está en estado `CERRADO`, la acción de marcar como resuelto debe estar deshabilitada en la UI, y el backend debe responder con un error para evitar modificaciones a históricos cerrados.
- **Acceso no autorizado**: Si un usuario intenta enviar una solicitud para cerrar un reporte de otro usuario, el backend debe validar la autoría y responder con error de denegación (`400 Bad Request` / `403 Forbidden`).

---

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer un endpoint `PATCH /api/reports/{id}/resolve` (o `PUT /api/reports/{id}/resolve`) para cambiar el estado de un reporte a `CERRADO`.
- **FR-002**: El backend debe validar que el usuario autenticado que realiza la petición sea el creador del reporte.
- **FR-003**: Al cambiar el estado a `CERRADO`, el backend debe registrar la fecha de actualización y persistir el estado.
- **FR-004**: El frontend debe consumir el endpoint `PATCH /api/reports/{id}/resolve` al hacer clic en el botón de resolver de la tarjeta.
- **FR-005**: La interfaz debe actualizar el estado visual de la tarjeta a `Cerrado` e inhabilitar los botones de edición inmediatamente después de la confirmación exitosa.

### Key Entities

- **Reporte (Entity)**: Campo `estado` que puede tomar valores de `ACTIVO`, `COINCIDENCIA` o `CERRADO`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: La actualización del estado de un reporte en el servidor y su confirmación en pantalla deben tomar menos de 300ms.
- **SC-002**: Al resolver el reporte, este debe dejar de figurar como "Activo" en los filtros de búsqueda general del feed de inmediato.
