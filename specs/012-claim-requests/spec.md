# Feature Specification: Solicitudes de reclamación de propiedad y evidencias (HU-19, HU-20, HU-21)

**Feature Branch**: `012-claim-requests`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Enviar solicitudes de reclamación (HU-19), gestionar solicitudes recibidas (HU-20) y proveer evidencias/justificaciones de propiedad (HU-21) en un flujo unificado."

## User Scenarios & Testing

### User Story 1 - Enviar solicitud de reclamación y proveer evidencias (HU-19, HU-21) (Priority: P1)
Como usuario que ha perdido un objeto, quiero enviar una solicitud de reclamación sobre un objeto encontrado por otro usuario, detallando un mensaje de prueba/evidencia de propiedad, para que el hallador pueda evaluar si me pertenece.

**Why this priority**: Es la acción principal para iniciar el proceso de recuperación del objeto perdido.
**Independent Test**: Visitar el detalle de un reporte de tipo `ENCONTRADO` creado por otro usuario, hacer clic en "Reclamar Propiedad", rellenar el formulario de evidencia en el modal y enviarlo. Confirmar que se crea el registro de reclamación y que el botón cambia a "Reclamado (Pendiente)".

**Acceptance Scenarios**:
1. **Given** un usuario autenticado visualizando el detalle de un reporte ajeno de tipo `ENCONTRADO`, **When** hace clic en "Reclamar Propiedad", **Then** se despliega un modal solicitando detallar las características del objeto para probar su propiedad.
2. **Given** el modal abierto, **When** el reclamante escribe un mensaje de justificación menor a 10 caracteres o lo deja vacío, **Then** el formulario muestra un error de validación y bloquea el envío.
3. **Given** una justificación válida, **When** el reclamante envía el formulario, **Then** se crea la solicitud en estado `PENDIENTE` en la base de datos y el reporte original permanece en estado `ACTIVO`.
4. **Given** que el usuario visualiza su propio reporte o un reporte de tipo `PERDIDO`, **When** se carga la página de detalle, **Then** el botón "Reclamar Propiedad" no se muestra.

---

### User Story 2 - Ver mis solicitudes enviadas y recibidas (HU-20) (Priority: P1)
Como usuario de la plataforma, quiero tener una sección unificada ("Solicitudes") en mi panel/dashboard para consultar el listado de reclamaciones que he enviado y las solicitudes que otros han hecho sobre los objetos que yo encontré.

**Why this priority**: Permite a los usuarios llevar el seguimiento y control de sus solicitudes activas.
**Independent Test**: Navegar a la pestaña "Solicitudes" en el Dashboard, comprobar que existen dos sub-secciones ("Recibidas" y "Enviadas") con los reportes asociados y sus estados actuales.

**Acceptance Scenarios**:
1. **Given** que el usuario ha reclamado objetos en el pasado, **When** entra a "Solicitudes Enviadas", **Then** ve el listado con la foto, título del objeto, fecha de envío, justificación provista y la etiqueta de estado (`PENDIENTE`, `ACEPTADA`, `RECHAZADA`).
2. **Given** que el usuario ha reportado objetos como encontrados, **When** entra a "Solicitudes Recibidas", **Then** ve el listado de personas que han reclamado sus objetos, mostrando el nombre del reclamante, su mensaje de prueba de propiedad y las acciones para Aceptar o Rechazar.

---

### User Story 3 - Gestionar solicitudes de reclamación recibidas (HU-20) (Priority: P1)
Como usuario que encontró un objeto, quiero poder **Aceptar** o **Rechazar** las solicitudes de reclamación recibidas en mis reportes en base a la evidencia descrita.

**Why this priority**: Cierra el ciclo de recuperación de pertenencias, permitiendo contactar de forma segura a ambas partes.
**Independent Test**: En "Solicitudes Recibidas", hacer clic en "Aceptar" sobre una reclamación pendiente. Verificar que el estado cambia a `ACEPTADA`, que el reporte se marca como `CERRADO` y que se despliega la información de contacto (correo) del reclamante.

**Acceptance Scenarios**:
1. **Given** una solicitud `PENDIENTE` recibida, **When** el hallador hace clic en "Rechazar", **Then** la solicitud pasa a estado `RECHAZADA`, el reporte asociado permanece `ACTIVO` y el reclamante puede ver el estado actualizado en su panel.
2. **Given** una solicitud `PENDIENTE` recibida, **When** el hallador hace clic en "Aceptar", **Then** la solicitud pasa a estado `ACEPTADA`, el reporte asociado cambia automáticamente de estado a `CERRADO` y todas las demás solicitudes pendientes para ese mismo reporte se actualizan automáticamente a `RECHAZADA`.
3. **Given** una solicitud que fue `ACEPTADA`, **When** cualquiera de las partes involucradas (reclamante o hallador) visualiza los detalles de la solicitud, **Then** el sistema muestra de forma destacada el nombre completo y el correo electrónico de la otra persona para facilitar el contacto.

---

## Edge Cases

- **Cierre automático de pendientes**: Si un reporte tiene 3 reclamaciones pendientes (A, B y C) y el hallador acepta la reclamación B, el sistema debe transaccionalmente marcar las reclamaciones A y C como `RECHAZADA` y el reporte como `CERRADO`.
- **Doble reclamación**: Un usuario no puede enviar más de una reclamación activa (en estado `PENDIENTE` o `ACEPTADA`) sobre el mismo reporte para evitar spam.
- **Acceso no autorizado**: Un usuario no puede aceptar o rechazar solicitudes de un reporte del cual no es el autor. El backend debe validar estrictamente la propiedad del reporte.

---

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer el recurso `/api/reclamaciones` (POST para crear, GET `/enviadas` y `/recibidas` para listar, POST `/{id}/aceptar` y `/{id}/rechazar` para cambiar de estado).
- **FR-002**: Las justificaciones de prueba de propiedad deben validar un largo mínimo de 10 caracteres.
- **FR-003**: Al aceptar una reclamación, el estado del reporte asociado debe pasar de `ACTIVO` a `CERRADO`.
- **FR-004**: El frontend debe deshabilitar el botón de "Reclamar" si el usuario ya cuenta con una solicitud pendiente para ese objeto.

### Key Entities

- **SolicitudReclamacion (Entity)**:
  - `id`: Autoincremental.
  - `reporte`: Relación con el reporte de hallazgo (`Reporte`).
  - `reclamante`: Relación con el usuario reclamante (`Usuario`).
  - `mensajePrueba`: Evidencia textual redactada por el reclamante (min. 10 chars).
  - `estado`: Enum (`PENDIENTE`, `ACEPTADA`, `RECHAZADA`).
  - `createdAt`, `updatedAt`: Marcas temporales.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Las solicitudes aceptadas cambian de estado de inmediato en la base de datos y se propagan de forma atómica a los reportes y reclamaciones concurrentes.
- **SC-002**: Cobertura de pruebas unitarias en `SolicitudReclamacionService` y de integración en `SolicitudReclamacionController` superior al **95%**.
- **SC-003**: Tiempo de respuesta para la creación y resolución de solicitudes inferior a 150 ms en promedio.
