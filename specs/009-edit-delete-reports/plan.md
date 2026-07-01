# Plan de Implementación: Editar y eliminar reportes propios (HU-13 y HU-14)

**Historias de Usuario**:
- `HU-13` Editar reportes activos
- `HU-14` Eliminar reportes propios

**Rama de Git**: `009-edit-delete-reports`

---

## 1. Objetivo

El objetivo de este plan es habilitar a los usuarios para editar y eliminar sus propias publicaciones de objetos perdidos o encontrados. Esto requiere endpoints REST en Spring Boot (`PUT /api/reports/{id}` y el ajuste de validación en `DELETE /api/reports/{id}`), pruebas de servicio y controladores, y una interfaz interactiva de edición en React que permita pre-rellenar datos, usar el mapa interactivo y guardar los cambios. También se implementarán botones de administración del reporte (Editar/Eliminar) en su respectiva pantalla de detalle.

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── service/
│   │   └── ReportService.java      <-- Agregar método updateReport [MODIFICAR]
│   └── controller/
│       └── ReportController.java   <-- Agregar endpoint PUT /api/reports/{id} [MODIFICAR]
└── src/test/java/com/david/backend/
    ├── service/
    │   └── ReportServiceTest.java  <-- Añadir pruebas unitarias para update y delete [MODIFICAR]
    └── controller/
        └── ReportControllerIntegrationTest.java <-- Añadir prueba de integración para PUT [MODIFICAR]

frontend/
├── src/
│   ├── api/
│   │   └── reportService.ts        <-- Agregar servicio updateReport [MODIFICAR]
│   ├── pages/
│   │   ├── MyReportsPage.tsx       <-- Modificar handleEdit para navegar a la edición [MODIFICAR]
│   │   ├── ReportDetailPage.tsx    <-- Agregar botones Editar/Eliminar para el autor [MODIFICAR]
│   │   └── EditReportPage.tsx      <-- Nueva página para editar reportes [NUEVO]
│   └── App.tsx                    <-- Registrar la ruta /reporte/:id/editar [MODIFICAR]
```

---

## 3. Cambios Propuestos

### Backend (Spring Boot)

#### [MODIFICAR] [ReportService.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/service/ReportService.java)
- Implementar `public ReportResponse updateReport(Usuario usuario, Long id, CreateReportRequest request)`:
  - Buscar el reporte por ID (lanzar `ResourceNotFoundException` si no existe).
  - Verificar que el reporte pertenezca al usuario autenticado. De lo contrario, lanzar un error de denegación (`RuntimeException` que resuelva en un 403 o lanzar un error controlado).
  - Validar que el reporte no esté en estado `CERRADO`.
  - Buscar la categoría por `request.getCategoriaId()`.
  - Actualizar los campos: `categoria`, `tipo`, `nombreObjeto`, `descripcion`, `lugar`, `fechaIncidente`.
  - Guardar el reporte en base de datos.
  - Retornar el `ReportResponse` actualizado.

#### [MODIFICAR] [ReportController.java](file:///c:/LABORATORIO/LostCampus/backend/src/main/java/com/david/backend/controller/ReportController.java)
- Implementar `@PutMapping("/{id}")` que reciba `@AuthenticationPrincipal Usuario usuario`, `@PathVariable Long id`, y `@Valid @RequestBody CreateReportRequest request`.
- Retornar `ResponseEntity.ok(reportService.updateReport(usuario, id, request))`.

---

### Frontend (React)

#### [MODIFICAR] [reportService.ts](file:///c:/LABORATORIO/LostCampus/frontend/src/api/reportService.ts)
- Exportar la función:
  ```typescript
  export async function updateReport(id: number, data: CreateReportRequest): Promise<Reporte> {
    const response = await axiosClient.put<Reporte>(`reports/${id}`, data);
    return response.data;
  }
  ```

#### [NEW] [EditReportPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/EditReportPage.tsx)
- Crear una página basada en `CreateReportPage.tsx` pero adaptada para la edición:
  - Extraer `:id` usando `useParams()`.
  - Realizar una llamada a `getReportById(Number(id))` en un `useEffect` para cargar los detalles actuales y rellenar los estados del formulario.
  - Comprobar que el usuario autenticado (de `useAuthStore`) sea el creador del reporte (`report.autor_id === user.id`). Si no es así, redirigir al feed y mostrar un toast de error.
  - Integrar el modal del mapa `CampusMapModal` y las validaciones de campos habituales.
  - Enviar una petición `PUT` llamando a `updateReport(id, data)` al enviar el formulario.
  - Redirigir al usuario al detalle del reporte `/reporte/:id` tras la actualización con un toast de éxito.

#### [MODIFICAR] [MyReportsPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/MyReportsPage.tsx)
- Modificar la función `handleEdit` para realizar la navegación:
  ```typescript
  const handleEdit = (id: number) => {
    navigate(`/reporte/${id}/editar`);
  };
  ```

#### [MODIFICAR] [ReportDetailPage.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/pages/ReportDetailPage.tsx)
- Importar `useAuthStore` para obtener el usuario autenticado actual.
- Verificar si `user && report && user.id === report.autor_id` y si el reporte está en estado `ACTIVO` o `COINCIDENCIA`.
- Si se cumple la condición, renderizar un panel de acciones rápidas para el propietario con los botones:
  - **Editar**: Navega a `/reporte/${report.id}/editar` (Estilo premium con icono `Edit2`).
  - **Eliminar**: Ejecuta el borrado pidiendo una confirmación antes de llamar a `deleteReport(report.id)`. En caso de éxito, redirigir a `/mis-reportes` con un mensaje toast.

#### [MODIFICAR] [App.tsx](file:///c:/LABORATORIO/LostCampus/frontend/src/App.tsx)
- Importar `EditReportPage` y registrar la ruta protegida `<Route path="/reporte/:id/editar" element={<EditReportPage />} />` dentro de `DashboardLayout`.

---

## 4. Plan de Verificación

### Pruebas Unitarias (Backend)
- `ReportServiceTest.java`:
  - `updateReport_Success`: Modifica los campos de un reporte del usuario y comprueba que se persistan los cambios.
  - `updateReport_NotFound_ThrowsException`: Lanza excepción ante un ID inválido.
  - `updateReport_Forbidden_ThrowsException`: Lanza excepción si otro usuario intenta editar la publicación.
  - `deleteReport_Forbidden_ThrowsException`: Lanza excepción si otro usuario intenta eliminar la publicación.

### Pruebas de Integración (Backend)
- `ReportControllerIntegrationTest.java`:
  - `updateReport_Success`: Llama a `PUT /api/reports/{id}` con JWT de autor y datos modificados, valida estatus `200 OK`.
  - `updateReport_Forbidden`: Llama a `PUT /api/reports/{id}` con JWT de otro usuario y valida estatus `403 Forbidden` (o `500` con mensaje controlado).
  - `deleteReport_Forbidden`: Llama a `DELETE /api/reports/{id}` con JWT ajeno y valida que falle la operación.

### Pruebas Manuales
1. Entrar con un usuario, ir a `/mis-reportes` y presionar el botón de editar en una tarjeta. Cambiar el título y lugar, y guardar. Validar que los datos se muestren actualizados.
2. Ir a la vista de detalles de un reporte propio y comprobar que aparezcan los botones "Editar" y "Eliminar". Hacer clic en "Eliminar", confirmar, y verificar que desaparezca del feed.
3. Intentar ingresar a `/reporte/ID_DE_OTRO/editar` y verificar que el sistema de navegación redirija con un toast de error.
