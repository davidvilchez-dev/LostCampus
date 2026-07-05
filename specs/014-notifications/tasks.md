# Tasks - Sistema de Notificaciones en Tiempo Real y Persistencia (HU-26)

- [ ] **Modelo de Datos y Repositorios**
  - [ ] Crear la entidad `Notificacion` en `com.david.backend.model`.
  - [ ] Crear el repositorio `NotificacionRepository` en `com.david.backend.repository`.

- [ ] **Servicios y Lógica de Negocio**
  - [ ] Crear la clase `WebSocketSubscriptionListener` en `com.david.backend.event` para rastrear suscripciones activas al chat.
  - [ ] Crear el servicio `NotificationService` en `com.david.backend.service`.
  - [ ] Modificar `SolicitudReclamacionService` para disparar notificaciones al enviar, aceptar y rechazar reclamaciones.
  - [ ] Modificar `ChatService` para disparar notificaciones de nuevos mensajes de chat si el interlocutor no está en la sala activa.

- [ ] **DTOs y Controladores**
  - [ ] Crear el DTO `NotificationResponse` en `com.david.backend.dto.response`.
  - [ ] Crear el controlador REST `NotificationController` en `com.david.backend.controller`.

- [ ] **Pruebas y Verificación Backend**
  - [ ] Crear pruebas unitarias para `NotificationService` (`NotificationServiceTest.java`).
  - [ ] Crear pruebas de integración para `NotificationController` (`NotificationControllerIntegrationTest.java`).
  - [ ] Asegurar cobertura JaCoCo superior al 95%.

- [ ] **Frontend**
  - [ ] Crear el archivo `notificationService.ts` en `frontend/src/api/`.
  - [ ] Crear el componente `NotificationBell.tsx` en `frontend/src/components/`.
  - [ ] Modificar `DashboardLayout.tsx` para suscribirse globalmente a las notificaciones por WebSocket y renderizar la campana.
  - [ ] Estilizar la campana y dropdown en `index.css`.
