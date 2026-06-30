# Plan de Implementación: Recuperación de Contraseña

**Historias de Usuario**:
- `HU-05` Recuperación de contraseña

**Rama de Git**: `006-password-recovery`

---

## 1. Objetivo

Implementar las vistas y la lógica frontend para la **Recuperación de Contraseña** (`/recuperar`) y el **Restablecimiento de Contraseña** (`/restablecer`). Se incluirá validación del dominio de correo institucional (`@unsch.edu.pe`), pantallas de confirmación de envío con advertencia de expiración (15 minutos), formularios con inputs de contraseña interactivos, y enlace desde la pantalla de Login.

---

## 2. Contexto Técnico

- Lenguaje/Versión: TypeScript / HTML5 / CSS3.
- Framework Frontend: React + Vite (Single Page Application).
- Estilos: Tailwind CSS.
- Enrutamiento: React Router.
- Notificaciones: React Toastify.
- Iconografía: Lucide React.
- Plataforma de Destino: Navegadores Web Modernos (Mobile-First).

---

## 3. Dependencias Principales

- `react-router`: Configuración e integración de las rutas `/recuperar` y `/restablecer` en `App.tsx` y navegación SPA.
- `react-toastify`: Mensajes de retroalimentación de envíos y éxitos.
- `lucide-react`: Iconos para campos (Mail, Lock, Key, Eye, EyeOff, etc.).

---

## 4. Consideraciones Técnicas y Riesgos

- **Riesgo: Validaciones Permisivas**: Permitir cualquier correo electrónico podría violar el criterio de aceptación que exige restringir al dominio institucional de la UNSCH.
  - *Mitigación*: Se programará una expresión regular en el cliente para verificar de forma obligatoria que el valor termine estrictamente en `@unsch.edu.pe`.

---

## 5. Estructura del Proyecto (Archivos a modificar y crear)

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── ForgotPasswordPage.tsx <-- Formulario de solicitud de enlace (HU-05) [NUEVO]
│   │   ├── ResetPasswordPage.tsx  <-- Formulario de asignación de nueva clave (HU-05) [NUEVO]
│   │   └── LoginPage.tsx          <-- Agregar enlace "¿Olvidaste tu contraseña?" [MODIFICAR]
│   └── App.tsx                    <-- Registrar las dos nuevas rutas públicas [MODIFICAR]
```

---

## 6. Cambios Propuestos

### Páginas Nuevas

#### [NEW] `frontend/src/pages/ForgotPasswordPage.tsx`
- Formulario de tarjeta central oscura para ingresar el correo institucional.
- Validación del dominio `@unsch.edu.pe`.
- Al enviar, cambia el estado a "Enviado" para renderizar un panel que indica el éxito de la operación, señalando que las instrucciones se enviaron y que el enlace expira en 15 minutos.
- Incluye enlace de regreso a `/login`.

#### [NEW] `frontend/src/pages/ResetPasswordPage.tsx`
- Formulario con campos: Nueva contraseña y Confirmar nueva contraseña (con iconos y botones de visibilidad).
- Validación de contraseña (mín. 6 caracteres y coincidencia).
- Al confirmar, simula una carga de 1 segundo, muestra un toast de éxito y redirige a `/login`.

### Modificación de Páginas Existentes

#### [MODIFICAR] `frontend/src/pages/LoginPage.tsx`
- Agregar un enlace "¿Olvidaste tu contraseña?" justo debajo del input de contraseña, que dirija a `/recuperar`.

### Rutas

#### [MODIFICAR] `frontend/src/App.tsx`
- Importar y registrar las rutas públicas `/recuperar` y `/restablecer`.

---

### 6.1. Orden de Implementación

1. Modificar `LoginPage.tsx` para agregar el enlace de recuperación.
2. Crear la página `ForgotPasswordPage.tsx` con validación de correo y pantalla de confirmación.
3. Crear la página `ResetPasswordPage.tsx` con formulario de contraseña y redirección.
4. Conectar las rutas en `App.tsx`.
5. Ejecutar compilación y verificar la redirección en el navegador.

---

## 7. Plan de Verificación

### Pruebas Manuales
- **Validación del Dominio**: Escribir `test@gmail.com` en `/recuperar` y verificar que el sistema lo rechace exigiendo dominio `@unsch.edu.pe`.
- **Flujo de Envío**: Ingresar un correo institucional y enviar. Constatar que aparezca la confirmación con la advertencia de expiración de 15 minutos.
- **Flujo de Restablecimiento**: Ingresar a `/restablecer` directamente. Tratar de ingresar contraseñas desiguales y corroborar el error. Completar de forma correcta, enviar y verificar la redirección a `/login`.

---

## 8. Backend (Spring Boot)

### Tabla de Base de Datos
- `usuarios` (id, nombre_completo, correo, contrasena_hash, foto_url, es_admin, activo, token_recuperacion, token_expiracion, created_at, updated_at)

### Archivos Backend

| Capa | Archivo | Propósito |
|------|---------|-----------|
| DTO Request | `dto/request/ForgotPasswordRequest.java` | Validar formato de correo para enviar enlace |
| DTO Request | `dto/request/ResetPasswordRequest.java` | Validar y recibir nueva contraseña y token |
| DTO Response | `dto/response/MessageResponse.java` | Responder con mensaje de confirmación simple |
| Servicio | `service/AuthService.java` | Generar y validar el token UUID y expirar en 15 minutos |
| Controlador | `controller/AuthController.java` | Exponer endpoints de recuperación y restablecimiento |

### Endpoints

| Método | Ruta | HU | Descripción |
|--------|------|----|-------------|
| POST | `/api/auth/forgot-password` | HU-05 | Generar token de recuperación y enviar correo/logs |
| POST | `/api/auth/reset-password` | HU-05 | Restablecer contraseña si el token es válido y no expiró |

---

## 9. Pruebas Unitarias y de Integración Automatizadas

### Pruebas Unitarias (`AuthServiceTest.java`)
- **`forgotPassword_Success`**: Verifica la generación de un token UUID único, asignación de 15 minutos de expiración en la entidad `Usuario`, y su correcta persistencia.
- **`resetPassword_Success`**: Verifica el restablecimiento exitoso de contraseña con un token válido y no expirado, actualizando el hash y limpiando el token de la base de datos.

### Pruebas de Integración (`AuthControllerIntegrationTest.java`)
- **`POST /api/auth/forgot-password` (Exitoso)**: Envía solicitud HTTP con correo válido y verifica respuesta `200 OK` con las instrucciones de recuperación.
- **`POST /api/auth/reset-password` (Exitoso)**: Simula restablecimiento de clave mediante token válido y confirma la actualización de seguridad del usuario.

