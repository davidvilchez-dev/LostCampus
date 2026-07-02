# Tablero de Scrum & Backlog de Producto: LostCampus (UNSCH)

Este es el tablero central de control para el desarrollo ágil de la plataforma **LostCampus** para la comunidad de la Universidad Nacional de San Cristóbal de Huamanga. Se trabaja utilizando el framework **Spec-Kit** para el desarrollo guiado por especificaciones (SDD).

---

## 📊 Estado General del Proyecto

| Sprint | Enfoque Principal | Historias | Esfuerzo Total | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Base del MVP y Reportes Core** | HU-01 a HU-10 | 42 Puntos | **Completado** |
| **Sprint 2** | **Gestión Avanzada de Reportes, Coincidencias y Solicitudes** | HU-11 a HU-21 | 53 Puntos | **En Desarrollo** |
| **Sprint 3** | **Panel Administrativo y Pulido Final** | HU-22 a HU-30 | ~30 Puntos (Est.) | *Pendiente* |

---

## 🏃‍♂️ Sprint 1: Base del MVP y Reportes Core

**Objetivo del Sprint**: Implementar el núcleo funcional del sistema (autenticación segura mediante JWT, registro/perfil de usuarios, creación de reportes con fotos subidas a Cloudinary, feed público de objetos y motor de búsqueda básico).

### Tablero de Tareas (Sprint 1)

| ID | Historia de Usuario | Módulo | Prioridad | Esfuerzo (SP) | Carpeta Spec-Kit | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HU-01** | Registro de usuario | Gestión de Usuarios | Alta | 5 | `specs/002-auth-login-register/` | 🟢 Completado |
| **HU-02** | Inicio de sesión (JWT) | Gestión de Usuarios | Alta | 3 | `specs/002-auth-login-register/` | 🟢 Completado |
| **HU-03** | Cierre de sesión | Gestión de Usuarios | Alta | 1 | `specs/002-auth-login-register/` | 🟢 Completado |
| **HU-04** | Gestión de perfil (Cloudinary) | Gestión de Usuarios | Media | 3 | `specs/005-user-profile/` | 🟢 Completado |
| **HU-05** | Recuperación de contraseña | Gestión de Usuarios | Media | 3 | `specs/006-password-recovery/` | 🟢 Completado |
| **HU-06** | Crear reporte de objeto perdido | Gestión de Reportes | Alta | 8 | `specs/004-reports-management/` | 🟢 Completado |
| **HU-07** | Crear reporte de objeto encontrado| Gestión de Reportes | Alta | 8 | `specs/004-reports-management/` | 🟢 Completado |
| **HU-08** | Subir fotografías a reportes | Gestión de Reportes | Alta | 5 | `specs/004-reports-management/` | 🟢 Completado |
| **HU-09** | Feed de reportes recientes | Gestión de Reportes | Alta | 3 | `specs/003-feed-dashboard/` | 🟢 Completado |
| **HU-10** | Búsqueda de reportes por palabras | Gestión de Reportes | Alta | 3 | `specs/003-feed-dashboard/` | 🟢 Completado |

---

## 🏃‍♂️ Sprint 2: Gestión Avanzada de Reportes, Coincidencias y Solicitudes

**Objetivo del Sprint**: Implementar el filtrado avanzado por fechas y categorías, la vista de detalle de reportes, edición/eliminación de reportes propios, listado personal de reportes, marcar como recuperado, motor de matching automático y solicitudes de reclamación de propiedad.

### Tablero de Tareas (Sprint 2)

| ID | Historia de Usuario | Módulo | Prioridad | Esfuerzo (SP) | Carpeta Spec-Kit | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HU-11** | Filtrar reportes por categoría, tipo y fecha | Gestión de Reportes | Alta | 3 | `specs/007-search-filters/` | 🟢 Completado |
| **HU-12** | Ver detalle completo de un reporte | Gestión de Reportes | Alta | 2 | `specs/008-report-detail/` | 🟢 Completado |
| **HU-13** | Editar reportes activos | Gestión de Reportes | Media | 3 | `specs/009-edit-delete-reports/` | 🟢 Completado |
| **HU-14** | Eliminar reportes propios | Gestión de Reportes | Media | 2 | `specs/009-edit-delete-reports/` | 🟢 Completado |
| **HU-15** | Listado de mis reportes | Gestión de Reportes | Media | 2 | `specs/011-my-reports-list/` | 🟢 Completado |
| **HU-16** | Marcar reporte como recuperado | Gestión de Reportes | Media | 2 | `specs/012-mark-recovered/` | 🟢 Completado |
| **HU-17** | Detección automática de coincidencias | Coincidencias | Alta | 13 | `specs/013-matching-detection/`| 🟢 Completado |
| **HU-18** | Consultar lista de coincidencias sugeridas | Coincidencias | Alta | 3 | `specs/014-matching-list/` | 🟢 Completado |
| **HU-19** | Enviar solicitud de reclamación | Solicitudes | Alta | 5 | `specs/012-claim-requests/` | 🟢 Completado |
| **HU-20** | Gestionar solicitudes de reclamación recibidas | Solicitudes | Alta | 5 | `specs/012-claim-requests/` | 🟢 Completado |
| **HU-21** | Proveer información adicional de propiedad | Solicitudes | Media | 3 | `specs/012-claim-requests/` | 🟢 Completado |
