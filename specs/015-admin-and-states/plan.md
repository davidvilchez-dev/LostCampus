# Plan de Implementación: Módulo Administrativo y Gestión de Estados (HU-27, HU-28, HU-29)

**Historias de Usuario**:
- `HU-27` Gestión automática de estados de reportes (ACTIVO, EN_PROCESO, RECUPERADO, historial de estados)
- `HU-28` Cierre manual de reporte por el autor (con cancelación de reclamos)
- `HU-29` Módulo de administración (listado general, filtros, moderación, eliminación, bitácora de auditoría)

**Rama de Git**: `015-admin-and-states`

---

## 1. Objetivo

Implementar la gestión avanzada de estados de reportes en LostCampus. Se registrará todo cambio de estado en una tabla de auditoría dedicada (`HistorialEstadoReporte`). Se permitirá a los autores cerrar sus publicaciones activas de manera manual, cancelando automáticamente los reclamos pendientes. Por último, se creará un Panel Administrativo protegido bajo Spring Security para usuarios administradores, permitiendo la moderación, el filtrado avanzado, la eliminación de reportes y la consulta de logs de auditoría administrativa (`LogAuditoriaAdmin`).

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── model/
│   │   ├── HistorialEstadoReporte.java <-- [NEW] Entidad JPA de auditoría de estados
│   │   └── LogAuditoriaAdmin.java      <-- [NEW] Entidad JPA de auditoría de acciones de administrador
│   ├── repository/
│   │   ├── HistorialEstadoReporteRepository.java <-- [NEW] Repositorio del historial de estados
│   │   └── LogAuditoriaAdminRepository.java      <-- [NEW] Repositorio del log de auditoría
│   ├── dto/
│   │   ├── request/
│   │   │   └── UpdateReportStatusRequest.java <-- [NEW] DTO para que el administrador actualice estados
│   │   └── response/
│   │       ├── HistorialEstadoResponse.java   <-- [NEW] DTO para el historial de estados
│   │       └── LogAuditoriaResponse.java      <-- [NEW] DTO para los logs de administración
│   ├── service/
│   │   ├── ReportService.java          <-- [MODIFICAR] Lógica de cerrado manual, borrado físico/lógico e historial
│   │   └── AdminService.java           <-- [NEW] Servicio para listado general, moderación y auditoría
│   ├── security/
│   │   └── JwtAuthenticationFilter.java <-- [MODIFICAR] Mapear ROLE_ADMIN en base al atributo esAdmin
│   │   └── SecurityConfig.java         <-- [MODIFICAR] Proteger /api/admin/** con ROLE_ADMIN
│   └── controller/
│       ├── ReportController.java       <-- [MODIFICAR] Endpoint para cerrar manual
│       └── AdminController.java        <-- [NEW] Controlador con endpoints administrativos seguros
└── src/test/java/com/david/backend/
    ├── service/
    │   └── AdminServiceTest.java       <-- [NEW] Pruebas unitarias del servicio de administración
    └── controller/
        └── AdminControllerIntegrationTest.java <-- [NEW] Pruebas de integración del panel de administración

frontend/
├── src/
│   ├── api/
│   │   ├── adminService.ts             <-- [NEW] Cliente Axios para endpoints /api/admin
│   │   └── reportService.ts            <-- [MODIFICAR] Añadir llamada closeReport
│   ├── components/
│   │   └── AdminRoute.tsx              <-- [NEW] Ruta protegida para validar rol administrador
│   ├── pages/
│   │   ├── ReportDetailPage.tsx        <-- [MODIFICAR] Integrar botón "Cerrar Publicación"
│   │   └── AdminPanelPage.tsx          <-- [NEW] Panel de administración (Reportes, Logs y Filtros)
│   └── App.tsx                         <-- [MODIFICAR] Configurar rutas del panel y protección
```

---

## 3. Detalle de Cambios

### Backend (Spring Boot)

#### [NEW] `HistorialEstadoReporte.java`
- Atributos: `id`, `reporte` (ManyToOne), `estadoAnterior` (String), `estadoNuevo` (String), `fechaCambio` (LocalDateTime).

#### [NEW] `LogAuditoriaAdmin.java`
- Atributos: `id`, `admin` (ManyToOne, Usuario), `accion` (String), `reporteId` (Long), `detalles` (String), `fechaAccion` (LocalDateTime).

#### [MODIFICAR] `JwtAuthenticationFilter.java`
- Al crear el `UsernamePasswordAuthenticationToken`, si `usuario.getEsAdmin()` es verdadero, asignar `SimpleGrantedAuthority("ROLE_ADMIN")` en la colección de roles.

#### [MODIFICAR] `SecurityConfig.java`
- Añadir `.requestMatchers("/api/admin/**").hasRole("ADMIN")` para denegar peticiones no administrativas.

#### [MODIFICAR] `ReportService.java`
- Crear un método privado `cambiarEstado(Reporte reporte, String nuevoEstado)`:
  - Guarda en `HistorialEstadoReporte` la transición.
  - Actualiza el estado en el reporte y guarda en base de datos.
- Reemplazar todas las asignaciones directas de `reporte.setEstado(...)` por este método unificado.
- Implementar `cerrarReporteManual(Usuario autor, Long reporteId)`:
  - Validar autoría.
  - Cambiar estado a `CERRADO`.
  - Cancelar todas las reclamaciones en estado `PENDIENTE` cambiándolas a `RECHAZADA`.
- Implementar flujo automático en el rechazo/cancelación:
  - Si un reporte pasa de `EN_PROCESO` y ya no quedan reclamos aceptados o pendientes de ese usuario, verificar si debe retornar a `ACTIVO`.

#### [NEW] `AdminService.java`
- Métodos:
  - `listarTodosLosReportes(filters...)`: Obtener lista total de publicaciones en el sistema.
  - `cambiarEstadoReporte(Usuario admin, Long id, String nuevoEstado)`: Modifica el estado y genera log de auditoría.
  - `eliminarReporte(Usuario admin, Long id, String motivo)`: Borra el reporte en cascada (chats, mensajes, reclamaciones, notificaciones) y guarda log de auditoría.
  - `listarLogsAuditoria()`: Retorna todas las entradas del log.

#### [NEW] `AdminController.java`
- Exponer `@RestController` con mapeo `/api/admin` protegido.
- Endpoints para reportes (listar, cambiar estado, eliminar) y para auditoría.

---

### Frontend (React)

#### [NEW] `adminService.ts`
- Axios client para interactuar con los endpoints `/api/admin`.

#### [NEW] `AdminRoute.tsx`
- Componente de ruta que redirige a `/feed` si `user` no está logueado o no tiene `es_admin === true`.

#### [MODIFICAR] `ReportDetailPage.tsx`
- Mostrar el botón "Cerrar publicación" en la sección de opciones del creador. Al hacer clic, abre `ConfirmModal` antes de enviar la petición de cierre.

#### [NEW] `AdminPanelPage.tsx`
- Interfaz con diseño premium:
  - Panel lateral con dos pestañas: **Publicaciones** e **Historial de Auditoría**.
  - Pestaña de Publicaciones: Tabla interactiva con filtros por estado, autor, fecha y tipo. Acciones rápidas para cambiar estado y eliminar con justificación.
  - Pestaña de Auditoría: Lista cronológica de actividades administrativas.

---

## 4. Plan de Verificación

### Pruebas Unitarias
- `AdminServiceTest.java`:
  - Probar que un usuario no administrador no pueda invocar métodos.
  - Validar generación correcta de registros de auditoría ante cambios de estado y eliminaciones.
- `ReportServiceTest.java`:
  - Verificar que el cierre manual de reporte cancele las reclamaciones pendientes.

### Pruebas de Integración
- `AdminControllerIntegrationTest.java`:
  - Probar endpoints bajo `/api/admin` con credenciales ADMIN (espera `200 OK`) y con credenciales de usuario normal (espera `403 Forbidden`).

### Pruebas Manuales
1. Entrar como un usuario normal, crear un reporte y comprobar que tiene botón para cerrarlo.
2. Iniciar sesión como administrador, ir a `/admin` y realizar moderaciones de estado y eliminaciones de reportes, luego revisar la pestaña de auditoría.
3. Intentar entrar a `/admin` como usuario común para comprobar la redirección.
