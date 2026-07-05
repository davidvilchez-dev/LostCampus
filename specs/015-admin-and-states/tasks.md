# Tasks - Módulo Administrativo y Gestión de Estados (HU-27, HU-28, HU-29)

- [x] **Modelo de Datos y Repositorios**
  - [x] Crear la entidad `HistorialEstadoReporte` en `com.david.backend.model`.
  - [x] Crear la entidad `LogAuditoriaAdmin` en `com.david.backend.model`.
  - [x] Crear el repositorio `HistorialEstadoReporteRepository`.
  - [x] Crear el repositorio `LogAuditoriaAdminRepository`.

- [x] **Seguridad e Infraestructura**
  - [x] Modificar `JwtAuthenticationFilter` para inyectar `ROLE_ADMIN` a la autenticación si `esAdmin` es true.
  - [x] Modificar `SecurityConfig` para proteger `/api/admin/**` con el rol de administración.

- [x] **Servicios y Lógica de Negocio**
  - [x] Modificar `ReportService` para implementar el método centralizado de cambio de estado que escribe en `HistorialEstadoReporte`.
  - [x] Implementar `cerrarReporteManual` en `ReportService` validando autoría y rechazando reclamos pendientes.
  - [x] Crear `AdminService` con métodos de moderación, listado general de reportes, eliminación en cascada y consulta de auditoría.

- [x] **Controladores y DTOs**
  - [x] Crear DTOs para el historial y los logs de auditoría administrativa.
  - [x] Crear el controlador REST `AdminController` con endpoints seguros `/api/admin/**`.
  - [x] Modificar `ReportController` para exponer el endpoint de cierre manual de reporte.

- [x] **Pruebas y Verificación Backend**
  - [x] Crear pruebas unitarias para `AdminService` (`AdminServiceTest.java`).
  - [x] Crear pruebas de integración para `AdminController` (`AdminControllerIntegrationTest.java`).
  - [x] Asegurar cobertura JaCoCo superior al 95% en los nuevos componentes.

- [x] **Frontend**
  - [x] Crear el cliente de llamadas Axios `adminService.ts`.
  - [x] Crear el componente protector `AdminRoute.tsx` para rutas administrativas.
  - [x] Modificar `App.tsx` para definir la ruta `/admin` y envolverla en `AdminRoute`.
  - [x] Crear `AdminPanelPage.tsx` con listado general, filtros, logs y modales de moderación/eliminación.
  - [x] Modificar `ReportDetailPage.tsx` para integrar el botón "Cerrar Publicación" con su respectiva confirmación.
