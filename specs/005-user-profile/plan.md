# Plan de Implementación: Gestión de Perfil de Usuario

**Historias de Usuario**:
- `HU-04` Gestión de perfil

**Rama de Git**: `005-user-profile`

---

## 1. Objetivo

Implementar la página de **Gestión de Perfil** (`/perfil`) para LostCampus. Esto abarca el diseño del formulario estructurado en dos columnas (columna izquierda para datos personales y avatar, columna derecha para cambio de contraseña), validaciones en tiempo real, toggle de visibilidad en campos de clave e integración con el almacén global de Zustand para persistir y actualizar el nombre y el avatar del usuario.

---

## 2. Contexto Técnico

- Lenguaje/Versión: TypeScript / HTML5 / CSS3.
- Framework Frontend: React + Vite (Single Page Application).
- Estilos: Tailwind CSS + CSS Vanilla para los efectos del contenedor y bordes de inputs.
- Enrutamiento: React Router.
- Estado Global: Zustand (para leer y actualizar dinámicamente los datos del usuario autenticado).
- Cliente HTTP: Axios (conexión preparada para envío multipart/form-data al subir foto).
- Notificaciones: React Toastify.
- Iconografía: Lucide React.
- Plataforma de Destino: Navegadores Web Modernos (Mobile-First).

---

## 3. Dependencias Principales

Las dependencias clave a utilizar para esta implementación son:
- `react-router`: Registro e integración de la ruta `/perfil` en el layout del dashboard privado.
- `zustand`: Conexión de los datos del usuario en el store para reflejar los cambios en el Topbar y Sidebar en tiempo real.
- `react-toastify`: Mensajes de confirmación al guardar datos o cambiar la clave.
- `lucide-react`: Iconos para visibilidad de contraseña, avatares, cerrados e indicadores de carga.

---

## 4. Consideraciones Técnicas y Riesgos

- **Riesgo: Sincronización del Avatar**: Al cambiar el avatar en la página de perfil, los avatares más pequeños de la cabecera y del menú lateral podrían no actualizarse si no están enlazados al mismo store de Zustand.
  - *Mitigación*: Se utilizará el hook selector de Zustand de forma reactiva en todos los componentes (`Sidebar`, `Topbar` y `ProfilePage`), asegurando la actualización instantánea.
- **Riesgo: Exposición de contraseña actual**: El formulario requiere ingresar la clave actual para validar, la cual no debe ser almacenada en el estado local de forma insegura.
  - *Mitigación*: Los valores de contraseña solo se enviarán en la petición HTTP y se limpiarán inmediatamente después del procesamiento.

---

## 5. Estructura del Proyecto (Archivos a modificar y crear)

```text
frontend/
├── src/
│   ├── pages/
│   │   └── ProfilePage.tsx        <-- Pantalla de perfil de usuario y seguridad [NUEVO]
│   ├── App.tsx                    <-- Registro de la ruta /perfil en el DashboardLayout [MODIFICAR]
│   └── components/
│       └── Sidebar.tsx            <-- Verificación de enlace en la barra de navegación lateral
```

---

## 6. Cambios Propuestos

### Páginas

#### [NEW] `frontend/src/pages/ProfilePage.tsx`
- Implementa la interfaz de la página de perfil de usuario estructurada en dos columnas:
  - **Columna Izquierda (Datos Personales)**:
    - Muestra la foto de perfil en formato circular con borde de destaque. Si no posee foto, muestra las iniciales con fondo degradado animado.
    - Botón de cámara flotante para arrastrar o cargar imágenes locales de avatar.
    - Campos de entrada: Nombre completo (con error de longitud) e indicador de Correo electrónico (deshabilitado para edición).
    - Selector desplegable para Carrera Universitaria.
    - Botón para guardar cambios que dispara la actualización del store de Zustand.
  - **Columna Derecha (Seguridad y Contraseña)**:
    - Campos utilizando estructura de inputs con iconos a la izquierda (candado) y botón de ojo a la derecha para visibilidad de caracteres: Contraseña actual, Nueva contraseña, Confirmación de nueva contraseña.
    - Funciones de validación al enviar (longitud de clave y coincidencia).
    - Botón destacado para confirmar la actualización de seguridad.
- Conecta el formulario de forma interactiva con las acciones del store `authStore.ts` (añadiendo una acción de actualización local si es necesario).

### Rutas y App

#### [MODIFICAR] `frontend/src/App.tsx`
- Importar la pantalla `ProfilePage`.
- Agregar la ruta `/perfil` dentro de las rutas del layout privado.

---

### 6.1. Orden de Implementación

1. Crear la pantalla `ProfilePage.tsx` estructurando el diseño de doble columna e inputs de contraseña.
2. Añadir la acción de actualización de datos de usuario en `authStore.ts` si corresponde.
3. Conectar la pantalla `/perfil` en las rutas de `App.tsx`.
4. Verificar de forma local la actualización dinámica de datos e imágenes en el navegador.

---

## 7. Plan de Verificación

### Pruebas Manuales
- **Acceso Protegido**: Comprobar que no se pueda ingresar a `/perfil` sin credenciales (redirige al login).
- **Validaciones de Seguridad**: Intentar cambiar la clave con contraseñas que no coincidan o que sean menores a 6 caracteres, verificando los mensajes de error en pantalla.
- **Sincronización en Tiempo Real**: Modificar el Nombre y guardar. Comprobar que el nombre del usuario o el avatar cambien de inmediato en el Sidebar (pie de barra) y en el Topbar sin requerir recargar el navegador.
- **Carga de Avatar**: Seleccionar una nueva imagen local, validar la previsualización del avatar principal y su sincronización instantánea con los cabezales.

---

## 8. Backend (Spring Boot)

### Tabla de Base de Datos
- `usuarios` (id, nombre_completo, correo, contrasena_hash, foto_url, es_admin, activo, created_at, updated_at)

### Archivos Backend

| Capa | Archivo | Propósito |
|------|---------|-----------|
| Servicio | `service/UserService.java` | Obtener perfil, actualizar datos, subir avatar, cambiar contraseña |
| Servicio | `service/CloudinaryService.java` | Subida de avatar a Cloudinary |
| DTO Request | `dto/request/UpdateProfileRequest.java` | Validaciones para actualización de perfil |
| DTO Response | `dto/response/UserResponse.java` | Proyección segura del usuario |
| Controlador | `controller/UserController.java` | Endpoints REST /api/users/* |

### Endpoints

| Método | Ruta | HU | Descripción |
|--------|------|----|-------------|
| GET | `/api/users/me` | HU-04 | Obtener perfil del usuario autenticado |
| PUT | `/api/users/me` | HU-04 | Actualizar nombre y foto de perfil |
| POST | `/api/users/me/avatar` | HU-04 | Subir avatar a Cloudinary |
| PUT | `/api/users/me/password` | HU-04 | Cambiar contraseña (actual + nueva) |

---

## 9. Pruebas Unitarias y de Integración Automatizadas

### Pruebas Unitarias (`UserServiceTest.java`)
- **`getProfile_Success`**: Verifica la correcta proyección del usuario en un DTO seguro (`UserResponse`).
- **`updateProfile_Success`**: Comprueba la actualización del nombre y la URL del avatar en la entidad, confirmando su persistencia.
- **`uploadAvatar_Success`**: Simula la subida de un archivo multipart a Cloudinary y verifica que la URL segura devuelta se asocie al usuario.
- **`changePassword_Success`**: Verifica el flujo correcto de cambio de contraseña validando la clave actual y encriptando la nueva.
- **`changePassword_WrongCurrentPassword_ThrowsException`**: Valida que se rechace el cambio si la contraseña actual proporcionada es incorrecta.

### Pruebas de Integración (`UserControllerIntegrationTest.java`)
- **`GET /api/users/me` (Autenticado)**: Envía una petición con token JWT válido y comprueba estatus `200 OK` con los datos del usuario en JSON.
- **`GET /api/users/me` (No Autenticado)**: Envía una petición sin cabecera y verifica que Spring Security retorne `403 Forbidden`.
- **`PUT /api/users/me` (Exitoso)**: Ejecuta una actualización de perfil autenticada y valida la persistencia del nuevo nombre y avatar con estatus `200 OK`.
