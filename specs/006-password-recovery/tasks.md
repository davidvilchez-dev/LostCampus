# Tareas de Implementación: Recuperación de Contraseña

**Historias de Usuario**:
- `HU-05` Recuperación de contraseña

**Rama de Git**: `006-password-recovery`

---

## Fase 1: Enlaces e Interfaz de login
- `[ ]` Modificar la página `LoginPage.tsx` para agregar el enlace de "¿Olvidaste tu contraseña?" debajo del campo de contraseña.
- `[ ]` Estilizar el enlace con transiciones suaves en tema oscuro.

## Fase 2: Pantalla de Solicitud de Recuperación (ForgotPasswordPage)
- `[ ]` Crear la página `ForgotPasswordPage.tsx` con estructura de tarjeta oscura y cabecera de logotipo.
- `[ ]` Integrar el campo de correo electrónico de tipo `AuthInput`.
- `[ ]` Programar la expresión regular de validación del dominio institucional `@unsch.edu.pe`.
- `[ ]` Diseñar y programar el panel de confirmación de envío ("Enlace enviado... expira en 15 minutos") en `ForgotPasswordPage` que se activa tras un envío exitoso.

## Fase 3: Pantalla de Restablecimiento de Clave (ResetPasswordPage)
- `[ ]` Crear la página `ResetPasswordPage.tsx` con campos para Nueva contraseña y Confirmación de contraseña.
- `[ ]` Programar los botones de visibilidad (ojo) independientes para cada input de contraseña.
- `[ ]` Implementar la validación de coincidencia de claves y longitud mínima (mín. 6 caracteres).
- `[ ]` Programar la simulación de restablecimiento y posterior redirección automática a `/login` con mensaje de éxito.

## Fase 4: Enrutamiento
- `[ ]` Importar `ForgotPasswordPage` y `ResetPasswordPage` en `App.tsx`.
- `[ ]` Configurar las rutas públicas `/recuperar` y `/restablecer` en `App.tsx`.

## Fase 5: Pruebas de Calidad, Responsividad y Accesibilidad
- `[ ]` Probar en navegador la validación de dominio institucional ingresando correos inválidos.
- `[ ]` Verificar el renderizado de la confirmación indicando explícitamente el tiempo de expiración de 15 minutos.
- `[ ]` Validar que el restablecimiento impida el envío ante claves erróneas o desiguales.
- `[ ]` Comprobar que tras un restablecimiento exitoso el flujo SPA redirija de inmediato al login.
- `[ ]` Validar responsividad móvil en las nuevas pantallas.
