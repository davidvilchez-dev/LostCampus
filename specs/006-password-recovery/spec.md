# Especificación de Funcionalidad: Recuperación de Contraseña

**Historias de Usuario**:

- `HU-05` Recuperación de contraseña

**Rama de Git**: `006-password-recovery`

**Creado**: `2026-06-29`

**Estado**: Completado

**Entrada**: Criterios de aceptación para restablecimiento de clave mediante correo electrónico institucional y redirecciones de seguridad.

---

## 1. Escenarios de Usuario y Pruebas

### Escenario de Usuario 1 — Envío de enlace de recuperación (Prioridad: P1)

Como usuario registrado que ha olvidado su contraseña, quiero ingresar mi correo institucional para recibir un enlace temporal de restablecimiento.

**Por qué esta prioridad**: Es fundamental para que los usuarios puedan reingresar a la plataforma si no recuerdan sus credenciales de acceso.

**Prueba Independiente**: Desde la pantalla de inicio de sesión, hacer clic en "¿Olvidaste tu contraseña?". Introducir un correo válido del dominio institucional (ej. `alumno@unsch.edu.pe`), presionar el botón de envío y verificar que se muestre un panel de confirmación indicando el envío del enlace con su tiempo de expiración.

**Criterios de Aceptación**:

1. **Dado** que el usuario no autenticado está en `/recuperar`, **Cuando** la página carga, **Entonces** el sistema debe mostrar un formulario con un campo para ingresar el correo institucional registrado.
2. **Dado** que el usuario ingresa un correo que no pertenece al dominio `@unsch.edu.pe`, **Cuando** intenta enviar el formulario, **Entonces** el sistema debe mostrar un error indicando que solo se admiten correos institucionales de la UNSCH.
3. **Dado** que el usuario ingresa un correo correcto, **Cuando** hace clic en "Enviar enlace", **Entonces** el sistema simula el envío y muestra un mensaje informando que las instrucciones han sido enviadas y que el enlace expira en 15 minutos.

---

### Escenario de Usuario 2 — Restablecimiento de clave mediante nueva contraseña (Prioridad: P1)

Como usuario que ha recibido el enlace de recuperación, quiero ingresar una nueva clave para reestablecer el acceso a mi cuenta.

**Prueba Independiente**: Acceder a la ruta `/restablecer`, completar los campos de nueva contraseña y su confirmación con valores coincidentes mayores a 6 caracteres, presionar el botón de actualizar y verificar que redirija al inicio de sesión.

**Criterios de Aceptación**:

1. **Dado** que el usuario accede a `/restablecer`, **Cuando** el formulario carga, **Entonces** el sistema muestra campos para ingresar la Nueva contraseña y la Confirmación de contraseña.
2. **Dado** que el usuario ingresa contraseñas no coincidentes o menores a 6 caracteres, **Cuando** presiona restablecer, **Entonces** se muestran los errores correspondientes en pantalla.
3. **Dado** que las claves son correctas y se confirma el cambio, **Cuando** se envía, **Entonces** el sistema muestra un mensaje de éxito y redirige a la página de inicio de sesión (`/login`).

---

## 2. Requisitos

### Requisitos Funcionales

- **RF-001 (Página de Recuperación — `/recuperar`)**:
  - Diseño visual alineado con el login (tarjeta central oscura, logotipo en cabecera).
  - Campo de entrada: Correo electrónico institucional.
  - Botón: "Enviar enlace de recuperación".
  - Enlace inferior para volver al inicio de sesión.
- **RF-002 (Página de Restablecimiento — `/restablecer`)**:
  - Campo de entrada: Nueva contraseña y Confirmar nueva contraseña (con botones de visibilidad de ojo).
  - Botón: "Restablecer contraseña".
- **RF-003 (Validaciones de Correo Institucional)**:
  - Verificar que el correo termine en `@unsch.edu.pe`.

---

## 3. Criterios de Éxito

- **SC-001 (Validación de Dominio)**: El sistema deniega el envío si el correo no cuenta con el dominio institucional de la UNSCH.
- **SC-002 (Estado de Expiración)**: La pantalla de confirmación de envío debe advertir expresamente sobre la expiración del enlace (15 minutos).
- **SC-003 (Redirección Exitosa)**: Tras el restablecimiento correcto, el usuario debe ser redirigido automáticamente a la pantalla de login para ingresar con sus nuevas credenciales.
