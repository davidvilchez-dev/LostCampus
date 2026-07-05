# Plan de Implementación: Solicitudes de reclamación de propiedad y evidencias (HU-19, HU-20, HU-21)

**Historias de Usuario**:
- `HU-19` Enviar solicitud de reclamación
- `HU-20` Gestionar solicitudes de reclamación recibidas
- `HU-21` Proveer información adicional de propiedad

**Rama de Git**: `012-claim-requests`

---

## 1. Objetivo

Implementar el flujo completo de reclamación de objetos encontrados en el campus. Permitirá a los reclamantes proveer una justificación/evidencia detallada para demostrar la propiedad del objeto y a los halladores gestionar las solicitudes (aceptar o rechazar). Al aceptar un reclamo, se revelan los datos de contacto y el reporte se cierra automáticamente.

---

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── dto/
│   │   ├── request/
│   │   │   └── CreateClaimRequest.java      <-- [NEW] DTO para los campos del reclamo
│   │   └── response/
│   │       └── ClaimResponse.java           <-- [NEW] DTO para el detalle del reclamo con datos de contacto
│   ├── model/
│   │   ├── EstadoReclamacion.java           <-- [NEW] Enum de estados: PENDIENTE, ACEPTADA, RECHAZADA
│   │   └── SolicitudReclamacion.java        <-- [NEW] Entidad JPA de reclamaciones
│   ├── repository/
│   │   └── SolicitudReclamacionRepository.java <-- [NEW] Repositorio JPA para reclamos
│   ├── service/
│   │   └── SolicitudReclamacionService.java <-- [NEW] Lógica de negocio (validación y transacciones)
│   └── controller/
│       └── SolicitudReclamacionController.java <-- [NEW] Endpoints para gestionar reclamos
└── src/test/java/com/david/backend/
    ├── service/
    │   └── SolicitudReclamacionServiceTest.java <-- [NEW] Pruebas unitarias para el servicio de reclamos
    └── controller/
        └── SolicitudReclamacionControllerIntegrationTest.java <-- [NEW] Pruebas de integración MockMvc

frontend/
├── src/
│   ├── api/
│   │   └── claimService.ts                  <-- [NEW] Cliente de API para reclamaciones
│   ├── components/
│   │   └── Sidebar.tsx                      <-- [MODIFICAR] Añadir enlace al dashboard de solicitudes
│   ├── pages/
│   │   ├── ClaimsPage.tsx                   <-- [NEW] Panel de solicitudes enviadas y recibidas
│   │   └── ReportDetailPage.tsx             <-- [MODIFICAR] Integrar modal y botón de reclamar
│   └── App.tsx                              <-- [MODIFICAR] Registrar ruta /solicitudes
```

---

## 3. Detalle de Cambios

### Backend (Spring Boot)

#### [NEW] `EstadoReclamacion.java`
- Definir un enum con los estados: `PENDIENTE`, `ACEPTADA`, `RECHAZADA`.

#### [NEW] `SolicitudReclamacion.java`
- Entidad JPA con campos `id`, `reporte` (ManyToOne), `reclamante` (Usuario, ManyToOne), `mensajePrueba` (TEXT), `estado` (Enum), `createdAt` y `updatedAt`.

#### [NEW] `SolicitudReclamacionRepository.java`
- Repositorio JPA con métodos de consulta por reclamante, por autor de reporte, y verificaciones de solicitudes previas.

#### [NEW] `CreateClaimRequest.java`
- DTO de entrada para validar el ID del reporte y el mensaje de prueba (mínimo 10 caracteres).

#### [NEW] `ClaimResponse.java`
- DTO de salida con los datos del reclamo, reporte y el intercambio seguro de correos.

#### [NEW] `SolicitudReclamacionService.java`
- `enviarSolicitud(reclamante, request)`: Validaciones de negocio (tipo ENCONTRADO, reporte ACTIVO, no reclamar propio reporte, no duplicados) y guardado.
- `listarEnviadas` / `listarRecibidas`: Consultas de listados.
- `aceptarSolicitud(usuario, id)`: Aceptar reclamo, cerrar reporte (`CERRADO`), y rechazar de forma transaccional todos los demás reclamos pendientes.
- `rechazarSolicitud(usuario, id)`: Cambiar estado a `RECHAZADA`.

#### [NEW] `SolicitudReclamacionController.java`
- Exponer recursos de la API REST bajo `/api/reclamaciones`.

---

### Frontend (React)

#### [NEW] `claimService.ts`
- Mapear servicios Axios para crear, listar y responder a solicitudes de reclamación.

#### [MODIFICAR] `Sidebar.tsx`
- Añadir el botón en el menú lateral *"Solicitudes"* que redirija a `/solicitudes`.

#### [MODIFICAR] `App.tsx`
- Definir la ruta `/solicitudes` apuntando a `ClaimsPage`.

#### [MODIFICAR] `ReportDetailPage.tsx`
- Cargar solicitudes enviadas del usuario logueado en la carga inicial.
- Si el usuario no es el autor y el reporte es de tipo `ENCONTRADO` y `ACTIVO`:
  - Si ya tiene un reclamo enviado, mostrar un badge deshabilitado.
  - Si no, mostrar el botón *"Reclamar Propiedad"*.
- Abrir un modal premium para capturar el mensaje de justificación y enviarlo.

#### [NEW] `ClaimsPage.tsx`
- Crear el dashboard de reclamos dividido en pestañas ("Solicitudes Recibidas" y "Solicitudes Enviadas").
- Mostrar la justificación descrita y habilitar botones rápidos de Aceptar y Rechazar (con confirmación de ConfirmModal).
- Si la solicitud es Aceptada, revelar los datos de contacto y habilitar enlaces para copiar e iniciar correo.

---

## 4. Plan de Verificación

### Pruebas Unitarias
- `SolicitudReclamacionServiceTest.java`: Verificar lógica de negocio, validaciones de envío y transaccionalidad de rechazos masivos automáticos.

### Pruebas de Integración
- `SolicitudReclamacionControllerIntegrationTest.java`: Probar los endpoints REST del controlador mediante `MockMvc` con autenticación JWT.

### Pruebas Manuales
1. Entrar como Usuario B y reportar un objeto como encontrado.
2. Entrar como Usuario A, buscar el reporte de B, presionar "Reclamar Propiedad", detallar la justificación y enviar.
3. Volver como Usuario B, ingresar al panel "Solicitudes", revisar el reclamo de A y aceptarlo.
4. Comprobar el intercambio de correos y el cierre automático del reporte.
