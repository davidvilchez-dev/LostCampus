# Plan de Implementación: Ver detalle completo de un reporte (HU-12)

**Historias de Usuario**:
- `HU-12` Ver detalle completo de un reporte

**Rama de Git**: `008-report-detail`

---

## 1. Objetivo

Implementar la vista detallada de publicaciones (`/reporte/:id`) en LostCampus. Esto requiere añadir un nuevo endpoint en el backend de Spring Boot para obtener reportes individuales por ID, y construir una interfaz responsiva en el frontend con soporte para carruseles de fotos, visualización del perfil del autor e indicadores visuales de estado.

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── service/
│   │   └── ReportService.java      <-- Añadir método getReportById [MODIFICAR]
│   └── controller/
│       └── ReportController.java   <-- Añadir endpoint GET /api/reports/{id} [MODIFICAR]
└── src/test/java/com/david/backend/
    ├── service/
    │   └── ReportServiceTest.java  <-- Pruebas unitarias de getReportById [MODIFICAR]
    └── controller/
        └── ReportControllerIntegrationTest.java <-- Pruebas de integración de getReportById [MODIFICAR]

frontend/
├── src/
│   ├── api/
│   │   └── reportService.ts        <-- Añadir función getReportById [MODIFICAR]
│   ├── pages/
│   │   └── ReportDetailPage.tsx    <-- Vista detallada del reporte [NUEVO]
│   └── App.tsx                    <-- Registrar ruta /reporte/:id [MODIFICAR]
```

---

## 3. Cambios Propuestos

### Backend (Spring Boot)

#### [MODIFICAR] [ReportService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/ReportService.java)
- Añadir `public ReportResponse getReportById(Long id)` que busque el reporte en `reporteRepository` o lance excepción `404 Not Found`.

#### [MODIFICAR] [ReportController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/ReportController.java)
- Añadir `@GetMapping("/{id}")` que reciba `@PathVariable Long id` y retorne `ResponseEntity.ok(reportService.getReportById(id))`.

---

### Frontend (React)

#### [MODIFICAR] [reportService.ts](file:///c:/LABORATORIO/LostCampus/frontend/src/api/reportService.ts)
- Exportar `export async function getReportById(id: number): Promise<Reporte>` llamando a `GET /api/reports/${id}`.

#### [NEW] [ReportDetailPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/ReportDetailPage.tsx)
- Pantalla que extrae `:id` usando `useParams()` de React Router.
- Renderiza una tarjeta premium de dos columnas en escritorio:
  - **Izquierda**: Galería/carrusel de hasta 3 fotos con transiciones fluidas. Si no hay imágenes, muestra placeholder con icono de cámara tachada.
  - **Derecha**: Título, tipo (PERDIDO en rojo, ENCONTRADO en verde), categoría, descripción completa, lugar, fecha y estado. Si el estado es 'RECUPERADO', muestra etiqueta verde animada de éxito.
  - **Autor**: Bloque con foto de perfil circular y nombre completo del reportante.
- Botones de acción rápida: "Volver al feed" y preparación para solicitudes de contacto.

#### [MODIFICAR] [App.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/App.tsx)
- Importar y registrar la ruta protegida `<Route path="/reporte/:id" element={<ReportDetailPage />} />` dentro de `DashboardLayout`.

---

## 4. Plan de Verificación

### Pruebas Unitarias
- `ReportServiceTest.java`:
  - `getReportById_Success`: Comprueba el retorno exitoso de un reporte existente.
  - `getReportById_NotFound_ThrowsException`: Valida que se lance error si el reporte no existe.

### Pruebas de Integración
- `ReportControllerIntegrationTest.java`:
  - `getReportById_Success`: Llama a `GET /api/reports/{id}` y comprueba la estructura JSON y estatus `200 OK`.
  - `getReportById_NotFound_Returns404`: Verifica estatus `404 Not Found` ante ID inexistente.
