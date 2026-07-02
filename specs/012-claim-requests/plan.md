# Implementation Plan: Solicitudes de reclamación de propiedad y evidencias (HU-19, HU-20, HU-21)

**Branch**: `012-claim-requests` | **Date**: 2026-07-02 | **Spec**: [spec.md](file:///c:/LABORATORIO/LostCampus/specs/012-claim-requests/spec.md)

**Input**: Feature specification from `/specs/012-claim-requests/spec.md`

## Summary
Implementar la infraestructura y vistas para la reclamación de objetos encontrados dentro del campus. Esto abarca desde la creación de la entidad en el backend y el guardado de la evidencia, hasta el panel de control del usuario para gestionar reclamos entrantes e interactuar con el reclamante mediante el intercambio de correos de contacto al aceptar la solicitud.

## Technical Context

**Language/Version**: Java 25 (Spring Boot 4.1.0) | TypeScript (React 19, Vite)

**Primary Dependencies**: Lombok, Spring Data JPA, Spring Security, Lucide React, React Router

**Storage**: PostgreSQL

**Testing**: JUnit 5, Mockito, MockMvc (Backend) | React Testing (Frontend)

**Target Platform**: Web Browser

---

## Constitution Check

- [x] **I. Decoupled Architecture**: Maintains strict Spring Boot 4 backend REST API and React 19 frontend SPA separation.
- [x] **II. Service Testing Rigor**: Full JUnit 5 and Mockito unit tests planned for `SolicitudReclamacionService`.
- [x] **III. Quality Gates**: Target coverage of >= 95% via JaCoCo for the new class modules.
- [x] **IV. REST Integration Testing**: Spring Boot MockMvc integration tests planned for `SolicitudReclamacionController` endpoints.
- [x] **V. Cloud-Native Storage**: N/A (no new image uploads, reuse existing report image URLs).
- [x] **VI. Security-First Auth**: Endpoint claims rely on Spring Security's `@AuthenticationPrincipal` for token validation.
- [x] **Agile/SDD**: Sized for a 3-day implementation.

---

## Proposed Changes

### Database Schema (PostgreSQL)
Crearemos una nueva tabla `solicitudes_reclamacion` con claves foráneas a `reportes` y `usuarios`:
```sql
CREATE TABLE solicitudes_reclamacion (
    id BIGSERIAL PRIMARY KEY,
    reporte_id BIGINT NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    reclamante_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje_prueba TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
```

### Backend Implementation

#### [NEW] [SolicitudReclamacion.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/model/SolicitudReclamacion.java)
Clase entidad JPA que mapea la tabla `solicitudes_reclamacion`.
* Campos: `id`, `reporte`, `reclamante`, `mensajePrueba`, `estado` (Enum: `PENDIENTE`, `ACEPTADA`, `RECHAZADA`), `createdAt`, `updatedAt`.

#### [NEW] [EstadoReclamacion.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/model/EstadoReclamacion.java)
Enum con valores `PENDIENTE`, `ACEPTADA`, `RECHAZADA`.

#### [NEW] [SolicitudReclamacionRepository.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/repository/SolicitudReclamacionRepository.java)
* Métodos:
  - `List<SolicitudReclamacion> findByReclamanteIdOrderByCreatedAtDesc(Long reclamanteId)`
  - `List<SolicitudReclamacion> findByReporteUsuarioIdOrderByCreatedAtDesc(Long usuarioId)`
  - `boolean existsByReporteIdAndReclamanteIdAndEstadoIn(Long reporteId, Long reclamanteId, Collection<EstadoReclamacion> estados)`
  - `List<SolicitudReclamacion> findByReporteIdAndEstado(Long reporteId, EstadoReclamacion estado)`

#### [NEW] [CreateClaimRequest.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/dto/request/CreateClaimRequest.java)
DTO de entrada que contiene `reporteId` y `mensajePrueba` (con anotación `@Size(min = 10, message = "La justificación debe tener al menos 10 caracteres")`).

#### [NEW] [ClaimResponse.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/dto/response/ClaimResponse.java)
DTO de salida con toda la información necesaria:
* ID de reclamo, ID del reporte, Nombre del objeto, URL de la primera imagen del objeto, Tipo del reporte, Lugar, Fecha del reporte.
* Nombre del reclamante, Correo del reclamante (solo expuesto si la solicitud fue aceptada o si el usuario logueado es el propio reclamante/autor).
* Mensaje de prueba, Estado actual, Fecha de creación.

#### [NEW] [SolicitudReclamacionService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/SolicitudReclamacionService.java)
Contiene la lógica de negocio y validaciones transaccionales:
* `enviarSolicitud(Usuario reclamante, CreateClaimRequest request)`:
  - Valida que el reporte sea `ENCONTRADO` y esté `ACTIVO`.
  - Valida que el reclamante no sea el autor del reporte.
  - Valida que el reclamante no tenga ya una solicitud `PENDIENTE` o `ACEPTADA` sobre ese reporte.
  - Inserta el registro.
* `listarEnviadas(Usuario reclamante)`: Retorna claims enviados.
* `listarRecibidas(Usuario creadorReporte)`: Retorna claims recibidos por sus objetos encontrados.
* `aceptarSolicitud(Usuario creadorReporte, Long id)`:
  - Valida que el reclamante no sea el mismo que el creador.
  - Valida que el usuario sea el autor del reporte asociado.
  - Cambia estado a `ACEPTADA`.
  - Modifica el reporte a estado `CERRADO`.
  - Busca todas las otras solicitudes `PENDIENTE` del mismo reporte y las cambia a `RECHAZADA`.
* `rechazarSolicitud(Usuario creadorReporte, Long id)`:
  - Valida que el usuario sea el autor del reporte asociado.
  - Cambia estado a `RECHAZADA`.

#### [NEW] [SolicitudReclamacionController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/SolicitudReclamacionController.java)
Expone la API REST:
* `POST /api/reclamaciones` (enviar)
* `GET /api/reclamaciones/enviadas`
* `GET /api/reclamaciones/recibidas`
* `POST /api/reclamaciones/{id}/aceptar`
* `POST /api/reclamaciones/{id}/rechazar`

---

### Frontend Implementation

#### [NEW] [claimService.ts](file:///c:/LABORATORIO/LostCampus/frontend/src/api/claimService.ts)
* `createClaim(reporteId: number, mensajePrueba: string)`
* `getSentClaims()`
* `getReceivedClaims()`
* `acceptClaim(id: number)`
* `rejectClaim(id: number)`

#### [MODIFY] [ReportDetailPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/ReportDetailPage.tsx)
* Mostrar el botón "Reclamar Propiedad" si:
  - El usuario logueado NO es el autor del reporte.
  - El reporte es de tipo `ENCONTRADO`.
  - El reporte está `ACTIVO`.
* Estado reactivo local para chequear si ya tiene un reclamo enviado (para deshabilitar el botón y mostrar "Reclamado (Pendiente)").
* Modal premium para escribir el texto de evidencia de propiedad de mínimo 10 caracteres con indicador de límite de texto y validaciones estéticas.

#### [NEW] [ClaimsPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/ClaimsPage.tsx)
* Nueva vista agregada al Dashboard del usuario a través de una ruta `/solicitudes`.
* Diseño premium con pestañas ("Solicitudes Recibidas" y "Solicitudes Enviadas").
* Listados interactivos usando tarjetas de alta fidelidad, con badges del estado del reclamo.
* Para reclamos recibidos: Botones rápidos "Aceptar" y "Rechazar" con diálogos de confirmación modales premium.
* Intercambio de información: Al Aceptar, revela de forma destacada el email de contacto del reclamante con botón directo para copiar y link de "Enviar Correo".

#### [MODIFY] [Navbar.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/components/Navbar.tsx)
* Agregar el enlace "Solicitudes" al menú de navegación si el usuario está autenticado.

---

## Verification Plan

### Automated Tests
- Crear `SolicitudReclamacionServiceTest.java` para comprobar todas las validaciones de negocio, rechazos automáticos y transaccionalidad.
- Crear `SolicitudReclamacionControllerIntegrationTest.java` usando `MockMvc` para verificar la autenticación y las respuestas HTTP de los endpoints creados.
- Ejecutar `./mvnw.cmd test` para confirmar el éxito del 100% de las pruebas y la cobertura adecuada.

### Manual Verification
1. Registrar un usuario A y un usuario B.
2. Iniciar sesión como Usuario A y publicar una mochila encontrada.
3. Iniciar sesión como Usuario B, buscar el reporte del Usuario A, hacer clic en "Reclamar Propiedad" y llenar una evidencia de propiedad de 5 palabras. El sistema debe impedir el envío por ser corta. Escribir 10+ caracteres y enviar.
4. Volver a iniciar sesión como Usuario A, ingresar a la pestaña "Solicitudes" -> "Recibidas", inspeccionar el reclamo y hacer clic en "Aceptar".
5. Confirmar que el reporte de la mochila cambia a estado `CERRADO` y se despliega el correo de contacto del reclamante.
