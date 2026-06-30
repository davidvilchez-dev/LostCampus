# Tablero de Scrum & Backlog de Producto: LostCampus (UNSCH)

Este es el tablero central de control para el desarrollo ágil de la plataforma **LostCampus** para la comunidad de la Universidad Nacional de San Cristóbal de Huamanga. Se trabaja en **3 Sprints** de una semana de duración cada uno, utilizando el framework **Spec-Kit** para el desarrollo guiado por especificaciones (SDD).

---

## 📊 Estado General del Proyecto

| Sprint | Enfoque Principal | Historias | Esfuerzo Total | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Base del MVP y Reportes Core** | HU-01 a HU-10 | 42 Puntos | **En Planificación** |
| **Sprint 2** | **Flujos de Reclamación y Comunicación** | HU-11 a HU-20 | ~35 Puntos (Est.) | *Pendiente* |
| **Sprint 3** | **Panel Administrativo y Pulido Final** | HU-21 a HU-30 | ~30 Puntos (Est.) | *Pendiente* |

---

## 🏃‍♂️ Sprint 1: Base del MVP y Reportes Core

**Objetivo del Sprint**: Implementar el núcleo funcional del sistema (autenticación segura mediante JWT, registro/perfil de usuarios, creación de reportes con fotos subidas a Cloudinary, feed público de objetos y motor de búsqueda básico).

### Tablero de Tareas (Sprint Backlog)

| ID | Historia de Usuario | Módulo | Prioridad | Esfuerzo (SP) | Carpeta Spec-Kit | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HU-01** | Registro de usuario | Gestión de Usuarios | Alta | 5 | `specs/002-registro-usuario/` | 🔴 Pendiente |
| **HU-02** | Inicio de sesión (JWT) | Gestión de Usuarios | Alta | 3 | `specs/003-inicio-sesion/` | 🔴 Pendiente |
| **HU-03** | Cierre de sesión | Gestión de Usuarios | Alta | 1 | `specs/004-cierre-sesion/` | 🔴 Pendiente |
| **HU-04** | Gestión de perfil (Cloudinary) | Gestión de Usuarios | Media | 3 | `specs/005-gestion-perfil/` | 🔴 Pendiente |
| **HU-05** | Recuperación de contraseña | Gestión de Usuarios | Media | 3 | `specs/006-recuperacion-pass/` | 🔴 Pendiente |
| **HU-06** | Crear reporte de objeto perdido | Gestión de Reportes | Alta | 8 | `specs/007-reporte-perdido/` | 🔴 Pendiente |
| **HU-07** | Crear reporte de objeto encontrado| Gestión de Reportes | Alta | 8 | `specs/008-reporte-encontrado/`| 🔴 Pendiente |
| **HU-08** | Subir fotografías a reportes | Gestión de Reportes | Alta | 5 | `specs/009-subir-fotos/` | 🔴 Pendiente |
| **HU-09** | Feed de reportes recientes | Gestión de Reportes | Alta | 3 | `specs/010-feed-reportes/` | 🔴 Pendiente |
| **HU-10** | Búsqueda de reportes por palabras | Gestión de Reportes | Alta | 3 | `specs/011-busqueda-palabras/`| 🔴 Pendiente |

*Nota: Hemos reservado el código `001` para la **Landing Page** (página de bienvenida pública), que actuará como la puerta de entrada a la plataforma antes de que el usuario inicie sesión.*

---

## 🔮 Roadmap de Sprints Futuros (Previsión)

### Sprint 2: Flujos de Reclamación y Comunicación (Planificado)
* **HU-11 a HU-14 (Gestión de Reclamos)**: Crear solicitud de reclamo, subir evidencias de propiedad, aprobar/rechazar reclamo por parte del hallador.
* **HU-15 a HU-17 (Chat Privado)**: Activación del chat en tiempo real tras la aceptación de un reclamo para coordinar la entrega.
* **HU-18 a HU-20 (Notificaciones y Coincidencias)**: Motor de cruce automático (match) de descripciones y alertas en la aplicación cuando se detectan objetos similares.

### Sprint 3: Administración y Calidad Final (Planificado)
* **HU-21 a HU-24 (Consola de Administración)**: Moderación de reportes, bloqueo de usuarios falsificados, gestión de categorías del campus.
* **HU-25 a HU-27 (Verificación Institucional)**: Restricción de acceso mediante el correo de la UNSCH o SSO institucional.
* **HU-28 a HU-30 (QA & Cierre)**: Pruebas de carga del servidor, optimización de renderizado en React 19 y verificación final de la cobertura del 95% con JaCoCo.

---

## 🛠️ Guía Rápida del Flujo Spec-Kit para el Desarrollador

Cuando trabajemos en una historia de usuario, el estado cambiará en este tablero y seguiremos rigurosamente las fases del Desarrollo Guiado por Especificaciones:

1. **Especificación (`spec.md`)**: `/speckit.specify` $\rightarrow$ Define qué hace la funcionalidad desde la perspectiva del usuario (Dado-Cuando-Entonces).
2. **Plan de Implementación (`plan.md`)**: `/speckit.plan` $\rightarrow$ Define la arquitectura técnica en código (controladores, servicios, estado de Zustand, estilos Tailwind v4).
3. **Tareas de Trabajo (`tasks.md`)**: `/speckit.tasks` $\rightarrow$ Lista de verificación técnica para la programación.
4. **Implementación y Calidad**: Escribir código + pruebas unitarias de servicios (JUnit 5 / Mockito) $\rightarrow$ Verificar el cumplimiento de la cobertura del 95% en el backend.
5. **Cierre (`checklist.md`)**: `/speckit.checklist` $\rightarrow$ Verificación final y merge a `main`.
