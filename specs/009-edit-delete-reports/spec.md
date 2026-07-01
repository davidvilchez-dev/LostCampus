# Feature Specification: Editar y eliminar reportes propios (HU-13 y HU-14)

**Feature Branch**: `009-edit-delete-reports`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Editar y eliminar reportes propios. Combinar HU-13 (Editar reportes activos) y HU-14 (Eliminar reportes propios) en un solo flujo."

## User Scenarios & Testing

### User Story 1 - Editar reporte propio activo (HU-13) (Priority: P1)
Como usuario, quiero editar mis reportes de objetos perdidos o encontrados activos para corregir detalles, cambiar la categoría o actualizar la fecha/lugar del incidente.

**Why this priority**: Permite corregir errores de dedo o complementar descripciones a medida que se obtiene más información sobre el objeto.

**Independent Test**: Hacer clic en el botón de edición de una tarjeta de reporte propio en el panel de control o en su detalle, modificar campos en el formulario, guardar y validar que los cambios se reflejen en la vista del feed y del detalle.

**Acceptance Scenarios**:
1. **Given** que el usuario es autor del reporte y el reporte está activo, **When** accede a la página de edición `/reporte/:id/editar`, **Then** visualiza el formulario pre-rellenado con la información actual del reporte.
2. **Given** que el usuario edita campos válidos y presiona "Guardar cambios", **When** se procesa la solicitud, **Then** el reporte se actualiza en base de datos y se muestra un mensaje de éxito en la UI.
3. **Given** que el usuario intenta editar un reporte de otro usuario, **When** realiza la petición, **Then** el sistema retorna error `403 Forbidden` y no permite guardar los cambios.
4. **Given** que el usuario abre el modal del mapa desde la pantalla de edición, **When** selecciona un punto, **Then** la ubicación del reporte se actualiza con la nueva dirección simplificada.

---

### User Story 2 - Eliminar reporte propio (HU-14) (Priority: P1)
Como usuario, quiero eliminar mis reportes para quitar publicaciones duplicadas, erróneas o que ya no desee que se muestren en la plataforma.

**Why this priority**: Mantiene el feed limpio y libre de publicaciones basura o accidentales.

**Independent Test**: Hacer clic en el botón "Eliminar" en una de las tarjetas en "Mis Reportes" o en el detalle, confirmar la acción, y comprobar que desaparece instantáneamente de la base de datos, del feed global y de la sección personal.

**Acceptance Scenarios**:
1. **Given** que el usuario es autor de la publicación, **When** hace clic en "Eliminar" y confirma la acción en el cuadro de diálogo, **Then** el reporte es eliminado de la base de datos y las imágenes asociadas se borran de Cloudinary.
2. **Given** que el reporte es eliminado con éxito, **When** el usuario es redirigido a sus reportes, **Then** visualiza la lista actualizada sin la publicación eliminada y recibe una alerta toast de confirmación.
3. **Given** que un usuario malintencionado intenta enviar una solicitud `DELETE /api/reports/{id}` sobre un reporte ajeno, **When** se ejecuta la solicitud en el backend, **Then** se retorna un código de error de autorización y el recurso no es eliminado.

---

## Edge Cases

- **Intento de edición de un reporte cerrado/recuperado**: Un usuario no debería poder editar un reporte que ya está en estado `CERRADO`. La UI debe deshabilitar o no mostrar la opción de editar para reportes cerrados, y el backend debe bloquear la actualización si el estado es cerrado.
- **Falla en el borrado de Cloudinary**: Si ocurre un error al intentar eliminar la imagen del servidor de Cloudinary (por token expirado o ID inexistente), el backend debe continuar con el borrado físico del reporte en la base de datos para no dejar registros huérfanos locales.

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer un endpoint `PUT /api/reports/{id}` que acepte un cuerpo JSON con la información actualizada del reporte.
- **FR-002**: El backend debe validar que el usuario autenticado sea el creador del reporte antes de permitir modificaciones (`PUT` o `DELETE`).
- **FR-003**: El backend no debe permitir modificar reportes cuyo estado actual sea `CERRADO`.
- **FR-004**: El frontend debe capturar el ID de la ruta en `/reporte/:id/editar`, consultar la API de detalles, y cargar el formulario de edición con dichos datos.
- **FR-005**: Al guardar cambios exitosamente, el frontend debe redirigir al usuario a la página de detalles del reporte `/reporte/:id` o a su panel personal `/mis-reportes` mostrando un toast de éxito.
- **FR-006**: La tarjeta de "Mis Reportes" (`MyReportCard.tsx`) debe enlazar el botón de edición para que navegue a `/reporte/:id/editar`.

### Key Entities

- **Reporte (Entity)**: Representa el objeto publicado. Posee una relación `ManyToOne` con `Usuario` (el autor) y `Categoria`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: La actualización del reporte en base de datos debe completarse en menos de 400ms tras el submit del formulario.
- **SC-002**: El borrado físico y la llamada para limpiar las imágenes en Cloudinary no deben retrasar la respuesta final de eliminación del reporte por más de 1.5 segundos.
