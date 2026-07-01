# Plan de Implementación: Filtrar reportes por categoría, tipo y fecha (HU-11)

**Historias de Usuario**:
- `HU-11` Filtrar reportes por categoría, tipo y fecha

**Rama de Git**: `007-search-filters`

---

## 1. Objetivo

Implementar un panel de búsqueda y filtrado dinámico integrado en el feed de reportes que permita filtrar por categorías múltiples, tipo de reporte (perdido/encontrado) y rango de fechas. El backend utilizará consultas dinámicas basadas en la API de Criterios (JPA Specification) para procesar combinaciones de filtros opcionales de manera limpia e inmune a fallos de casting en PostgreSQL. El frontend contará con selectores interactivos multicategoría, inputs de rango de fechas y reseteo completo de filtros.

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── repository/
│   │   └── ReporteRepository.java   <-- Añadir herencia de JpaSpecificationExecutor [MODIFICAR]
│   ├── service/
│   │   └── ReportService.java      <-- Construcción de Specification dinámica [MODIFICAR]
│   └── controller/
│       └── ReportController.java   <-- Mapear nuevos parámetros opcionales del endpoint [MODIFICAR]
└── src/test/java/com/david/backend/
    ├── service/
    │   └── ReportServiceTest.java  <-- Mock de findAll con Specification [MODIFICAR]
    └── controller/
        └── ReportControllerIntegrationTest.java <-- Test de integración para filtros avanzados [MODIFICAR]

frontend/
├── src/
│   ├── api/
│   │   └── reportService.ts        <-- Interfaz ReportFilters y parámetros dinámicos [MODIFICAR]
│   └── pages/
│       └── FeedPage.tsx            <-- Componente visual de filtros y reseteo [MODIFICAR]
```

---

## 3. Cambios Propuestos

### Backend (Spring Boot)

#### [MODIFICAR] [ReporteRepository.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/repository/ReporteRepository.java)
- Extender `JpaSpecificationExecutor<Reporte>` para dar soporte a consultas dinámicas complejas.

#### [MODIFICAR] [ReportService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/ReportService.java)
- Crear el método `getReports(...)` con filtros de categorías, tipo, rango de fechas y dirección de ordenamiento.
- Implementar la lógica de creación de la Specification acumulativa de predicados.
- Retornar la página de reportes proyectada a DTOs `ReportResponse`.

#### [MODIFICAR] [ReportController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/ReportController.java)
- Enlazar la llamada HTTP `GET /api/reports` recibiendo `List<Long> categorias`, `String tipo`, `LocalDate start_date` y `LocalDate end_date`.

---

### Frontend (React)

#### [MODIFICAR] [reportService.ts](file:///c:/LABORATORIO/LostCampus/frontend/src/api/reportService.ts)
- Añadir la interfaz `ReportFilters` para tipar correctamente los criterios opcionales de búsqueda.
- Serializar la lista de categorías a formato de comas (`join(',')`) al enviar la llamada Axios.

#### [MODIFICAR] [FeedPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/FeedPage.tsx)
- Estructurar el panel colapsable "Filtros avanzados" y botones rápidos de tipo de reporte (Todos, Perdidos, Encontrados).
- Proveer selección multicategorías y campos de fecha con validación.
- Agregar botón de reseteo rápido para limpiar todos los filtros de una sola vez.

---

## 4. Plan de Verificación

### Pruebas Unitarias
- `ReportServiceTest.java`:
  - `getReports_WithFilters_Success`: Simula la consulta del repositorio con Specification y valida el mapeo correcto.
  - `getReports_InvalidDateRange_ThrowsException`: Valida que se arroje una excepción si la fecha final es menor a la de inicio.

### Pruebas de Integración
- `ReportControllerIntegrationTest.java`:
  - `getReportsFeed_WithFilters_Success`: Ejecuta una petición HTTP real pasando múltiples filtros y verifica que el contenido de retorno se restrinja a los registros esperados.

### Pruebas Manuales
- Verificar visualmente la responsividad del panel de filtros avanzado en el feed y el comportamiento del botón "Restablecer todo".
