# Plan de Implementación: Listar y marcar reportes como recuperados (HU-15 y HU-16)

**Historias de Usuario**:
- `HU-15` Listado de mis reportes
- `HU-16` Marcar reporte como recuperado

**Rama de Git**: `010-my-reports-resolve`

---

## 1. Objetivo

Habilitar la persistencia para marcar reportes como recuperados. Aunque el listado de reportes propios (`HU-15`) y la vista del frontend ya están estructuradas, la acción de resolver (`HU-16`) requiere un endpoint en Spring Boot (`PATCH /api/reports/{id}/resolve`) con su lógica de verificación de propietario. En el frontend, se conectará el botón de confirmación de la tarjeta con esta API, permitiendo guardar el cambio de estado a `CERRADO` en la base de datos de manera definitiva.

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── service/
│   │   └── ReportService.java      <-- Implementar método resolveReport [MODIFICAR]
│   └── controller/
│       └── ReportController.java   <-- Agregar endpoint PATCH /api/reports/{id}/resolve [MODIFICAR]
└── src/test/java/com/david/backend/
    ├── service/
    │   └── ReportServiceTest.java  <-- Añadir pruebas unitarias para resolveReport [MODIFICAR]
    └── controller/
        └── ReportControllerIntegrationTest.java <-- Añadir pruebas de integración para PATCH [MODIFICAR]

frontend/
├── src/
│   ├── api/
│   │   └── reportService.ts        <-- Agregar función resolveReport [MODIFICAR]
│   └── pages/
│       └── MyReportsPage.tsx       <-- Conectar handleResolve con la llamada de API [MODIFICAR]
```

---

## 3. Cambios Propuestos

### Backend (Spring Boot)

#### [MODIFICAR] [ReportService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/ReportService.java)
- Implementar `public ReportResponse resolveReport(Usuario usuario, Long id)`:
  - Buscar reporte por ID.
  - Verificar que el reporte pertenezca al usuario autenticado (de lo contrario lanzar `RuntimeException` / error de autorización).
  - Verificar que el reporte no se encuentre ya `CERRADO`.
  - Cambiar el estado del reporte a `"CERRADO"`.
  - Guardar el reporte modificado.
  - Retornar el `ReportResponse` mapeado.

#### [MODIFICAR] [ReportController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/ReportController.java)
- Registrar el endpoint `@PatchMapping("/{id}/resolve")` para llamar a `reportService.resolveReport(usuario, id)`.

---

### Frontend (React)

#### [MODIFICAR] [reportService.ts](file:///c:/LABORATORIO/LostCampus/frontend/src/api/reportService.ts)
- Implementar y exportar la función `resolveReport`:
  ```typescript
  export async function resolveReport(id: number): Promise<Reporte> {
    const response = await axiosClient.patch<Reporte>(`reports/${id}/resolve`);
    return response.data;
  }
  ```

#### [MODIFICAR] [MyReportsPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/MyReportsPage.tsx)
- Modificar `handleResolve(id: number)` para:
  - Pedir confirmación al usuario antes de proceder (`window.confirm` o modal).
  - Llamar a `resolveReport(id)`.
  - Actualizar la lista en el estado local marcando el reporte como `CERRADO` y con su motivo de cierre.
  - Mostrar un toast de éxito.

---

## 4. Plan de Verificación

### Pruebas Unitarias
- `ReportServiceTest.java`:
  - `resolveReport_Success`: Cambia exitosamente el estado a `CERRADO` y guarda en el repositorio.
  - `resolveReport_NotFound_ThrowsException`: Lanza excepción si el ID de reporte no existe.
  - `resolveReport_Forbidden_ThrowsException`: Lanza excepción si un usuario que no es el autor intenta resolverlo.
  - `resolveReport_AlreadyClosed_ThrowsException`: Lanza excepción si el reporte ya estaba resuelto.

### Pruebas de Integración
- `ReportControllerIntegrationTest.java`:
  - `resolveReport_Success`: Llama a `PATCH /api/reports/{id}/resolve` con token del propietario, comprueba estatus `200 OK` y el estado final en el JSON.
  - `resolveReport_Forbidden`: Llama al endpoint con token de otro usuario y comprueba error `400 Bad Request` (mensaje controlado de autorización).

### Pruebas Manuales
1. Crear un reporte de prueba, navegar a "Mis reportes", presionar el botón de check de resolución.
2. Confirmar la ventana emergente, verificar que la tarjeta cambie su estado a "Cerrado" y que se deshabilite el botón de edición.
3. Volver al feed principal y confirmar que la tarjeta del reporte correspondiente aparezca con el badge verde de "Recuperado".
