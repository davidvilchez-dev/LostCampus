# Feature Specification: Ver detalle completo de un reporte (HU-12)

**Feature Branch**: `008-report-detail`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Ver el detalle completo de un reporte incluyendo fotos, descripción, lugar y estado, autor, etc."

## User Scenarios & Testing

### User Story 1 - Ver detalle completo de un reporte (HU-12) (Priority: P1)
Como usuario, quiero ver el detalle completo de un reporte incluyendo fotos, descripción, lugar y estado para evaluar si corresponde a mi objeto perdido o encontrado.

**Why this priority**: Es clave para que los usuarios puedan identificar plenamente un objeto y ver los datos de contacto/autor antes de iniciar cualquier reclamo.

**Independent Test**: Hacer clic en una tarjeta de reporte en el feed y comprobar la redirección a `/reporte/:id` con la carga correcta de datos de la publicación.

**Acceptance Scenarios**:
1. **Given** que el usuario hace clic en un reporte del feed, **When** se carga la página de detalles, **Then** visualiza el nombre del objeto, descripción, lugar, fecha del incidente, categoría, tipo de reporte y estado actual.
2. **Given** que el reporte tiene imágenes asociadas, **When** el usuario entra a la vista de detalle, **Then** ve una galería/carrusel de hasta 3 fotografías ampliables.
3. **Given** que el reporte no tiene imágenes, **When** se visualiza el detalle, **Then** muestra una imagen placeholder de "Imagen no disponible".
4. **Given** que el usuario accede al detalle, **When** visualiza el autor de la publicación, **Then** ve el nombre completo y la foto de perfil del reportante.
5. **Given** que el reporte se encuentra resuelto, **When** se carga el detalle, **Then** se muestra claramente un indicador visual de estado 'Recuperado'.

---

## Requirements

### Functional Requirements
- **FR-001**: El backend debe exponer un endpoint `GET /api/reports/{id}` para obtener un reporte por su identificador.
- **FR-002**: El frontend debe capturar el ID de la ruta dinámica `/reporte/:id` y realizar la consulta de detalles al servidor.
- **FR-003**: Si el reporte está en estado 'RECUPERADO', la UI debe mostrar un badge distintivo de color verde indicando éxito.

## Success Criteria

### Measurable Outcomes
- **SC-001**: La página de detalle de reporte se renderiza en el cliente en menos de 300ms tras recibir la respuesta del servidor.
