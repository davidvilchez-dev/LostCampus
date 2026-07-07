# Feature Specification: Detección automática y consulta de coincidencias (HU-17 y HU-18)

**Feature Branch**: `011-matching-detection`

**Created**: 2026-07-01

**Status**: Completado

**Input**: User description: "Detección automática de coincidencias (HU-17) y consultar lista de coincidencias sugeridas (HU-18) en un solo flujo."

## User Scenarios & Testing

### User Story 1 - Detección automática de coincidencias (HU-17) (Priority: P1)

Como sistema, quiero buscar y sugerir coincidencias automáticas entre objetos perdidos y encontrados en base a similitud de categoría, tipo opuesto, texto (Jaccard), lugar y fecha, con un score calculado.

**Why this priority**: Es el motor de inteligencia de la aplicación que ayuda a conectar a las personas que perdieron objetos con quienes los encontraron.

**Independent Test**: Invocar el endpoint `GET /api/reports/{id}/matches` para un reporte activo y comprobar que retorne una lista de reportes candidatos ordenados de mayor a menor relevancia de score.

**Acceptance Scenarios**:

1. **Given** un reporte del usuario activo, **When** el sistema calcula coincidencias, **Then** aplica los filtros duros: misma categoría, tipos opuestos (PERDIDO vs ENCONTRADO), ambos en estado `ACTIVO` y con diferencia temporal máxima de 30 días.
2. **Given** los candidatos filtrados, **When** se evalúa su puntuación, **Then** se calcula como: `Score = (Similitud Jaccard de texto * 0.60) + (Coincidencia palabras clave lugar * 0.25) + (Proximidad temporal * 0.15)`.
3. **Given** que el score obtenido es menor al umbral de `0.30`, **When** se arma el listado de sugerencias, **Then** el candidato es descartado.

---

### User Story 2 - Consultar lista de coincidencias sugeridas (HU-18) (Priority: P1)

Como usuario, quiero ver una lista de coincidencias sugeridas en el detalle de mi reporte para poder contactar al reportante o reclamar mi pertenencia.

**Why this priority**: Es la interfaz gráfica que le permite al usuario tomar acción sobre las coincidencias detectadas por el sistema.

**Independent Test**: Abrir la página de detalle de un reporte propio (`/reporte/:id`), confirmar que aparece la sección "Coincidencias Sugeridas" y que al hacer clic en una tarjeta de coincidencia redirige a su página de detalle correspondiente.

**Acceptance Scenarios**:

1. **Given** que un reporte propio tiene coincidencias con score >= 0.30, **When** el usuario entra al detalle, **Then** el sistema muestra un panel lateral o sección "Coincidencias Sugeridas" listando las tarjetas con su porcentaje de coincidencia.
2. **Given** que un reporte no tiene coincidencias sugeridas, **When** se carga el detalle, **Then** muestra el mensaje descriptivo _"No se encontraron coincidencias en este momento"_.
3. **Given** que el usuario hace clic en una coincidencia, **When** se ejecuta la acción, **Then** navega al detalle del otro reporte para revisar la información de contacto del otro usuario.

---

## Edge Cases

- **Reportes cerrados o inactivos**: Los reportes en estado `CERRADO` no deben evaluarse ni sugerirse como coincidencia para evitar falsos positivos de objetos ya devueltos.
- **Autoría de reportes**: Un reporte no debe sugerirse como coincidencia de sí mismo ni de otros reportes del mismo usuario (evitar sugerir duplicados del mismo autor).

---

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer el endpoint `GET /api/reports/{id}/matches` retornando los reportes candidatos con su porcentaje de coincidencia.
- **FR-002**: El backend debe filtrar palabras vacías en español (stop-words) antes de calcular la similitud Jaccard.
- **FR-003**: El frontend debe cargar las coincidencias del reporte si el usuario logueado es el autor.
- **FR-004**: Las tarjetas de coincidencia deben mostrar visualmente el porcentaje calculado (ej: _"75% de coincidencia"_).

### Key Entities

- **Reporte (Entity)**: Para calcular coincidencia por fecha, lugar y categoría.
