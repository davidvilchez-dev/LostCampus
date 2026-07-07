# Feature Specification: Filtrar reportes por categoría, tipo y fecha (HU-11)

**Feature Branch**: `007-search-filters`

**Created**: 2026-06-30

**Status**: Completado

**Input**: User description: "Filtrar reportes por categoría, tipo de reporte (perdido/encontrado) y rango de fechas."

## User Scenarios & Testing

### User Story 1 - Filtrar reportes por categoría, tipo y fecha (HU-11) (Priority: P1)

Como usuario, quiero filtrar reportes por categoría (llaves, ropa, electrónico, documentos, otros), tipo de reporte (perdido / encontrado) y rango de fechas para acotar mis resultados de búsqueda.

**Why this priority**: Es la funcionalidad principal del feed para que los usuarios puedan acotar los reportes y encontrar objetos de forma estructurada.

**Independent Test**: Filtrar reportes seleccionando varias categorías, indicando el tipo de reporte ("Perdidos" o "Encontrados") y fijando un rango de fechas válido.

**Acceptance Scenarios**:

1. **Given** que el usuario está en el feed principal, **When** selecciona la categoría "Electrónica" y tipo "Perdido", **Then** el listado muestra únicamente reportes de electrónica que estén perdidos.
2. **Given** que el usuario especifica un rango de fechas, **When** la fecha de inicio es posterior a la fecha de fin, **Then** el sistema muestra una advertencia visual "La fecha de inicio debe ser anterior o igual a la de fin" y no permite enviar la búsqueda.
3. **Given** que el usuario ingresa un filtro que no coincide con ningún reporte, **When** se actualiza el feed, **Then** se muestra el mensaje "No se encontraron reportes con los filtros aplicados".
4. **Given** que el usuario tiene filtros activos, **When** presiona el botón de reseteo, **Then** todos los filtros se limpian y el feed vuelve a mostrar todos los reportes.

---

## Requirements

### Functional Requirements

- **FR-001**: El sistema debe proveer una consulta dinámica en el servidor (JPA Specification) para combinar filtros opcionales de categoría, tipo y rango de fechas sin errores de inferencia de tipo.
- **FR-002**: El usuario debe poder seleccionar una o más categorías de forma simultánea (filtro "IN").
- **FR-003**: El cliente debe validar en el frontend que el rango de fechas sea correcto antes de enviar la petición de búsqueda.
- **FR-004**: Proporcionar un botón interactivo de limpieza de filtros.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Las peticiones de filtros dinámicos se resuelven en el backend en menos de 200ms.
- **SC-002**: El feed se actualiza de manera reactiva y automática en el frontend al alterar cualquier filtro con un debounce de 300ms.
