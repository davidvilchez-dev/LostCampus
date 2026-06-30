# Tareas de Implementación: Autenticación — Login y Registro

**Historias de Usuario**:
- `HU-01` Registro de usuario
- `HU-02` Iniciar sesión
- `HU-03` Cerrar sesión

**Rama de Git**: `002-auth-login-register`

---

## Fase 1: Estilos e Inputs
- `[x]` Definir clases CSS de estructura de tarjeta (fondo sólido oscuro, bordes, sombras) en `index.css`.
- `[x]` Definir clases CSS para inputs de formulario (fondo, márgenes, bordes, foco y estados de error) en `index.css`.
- `[x]` Definir clases CSS para botones de envío (transiciones, estados hover) en `index.css`.
- `[x]` Crear el componente base de entrada de datos `AuthInput.tsx`.
- `[x]` Integrar iconos descriptivos del campo a la izquierda del input en `AuthInput`.
- `[x]` Implementar botón interactivo de visibilidad para campos de clave en `AuthInput`.
- `[x]` Implementar contenedor de error y renderizado de texto condicional con iconos de alerta en `AuthInput`.

## Fase 2: Servicios y Almacenes de Estado
- `[x]` Configurar función de registro de usuarios en `authService.ts`.
- `[x]` Configurar función de inicio de sesión en `authService.ts`.
- `[x]` Implementar respuestas simuladas (mock) con retardos temporales asíncronos en los servicios de red.
- `[x]` Crear el almacén central de sesión del usuario en `authStore.ts`.
- `[x]` Definir variables de estado (`user`, `token`, `isAuthenticated`, `isLoading`, `error`) en el store.
- `[x]` Implementar la acción asíncrona de registro conectada con el servicio en el store.
- `[x]` Implementar la acción asíncrona de inicio de sesión conectada con el servicio en el store.
- `[x]` Implementar la acción de cierre de sesión para limpiar el estado global en el store.

## Fase 3: Pantallas y Formularios
- `[x]` Crear la estructura base de la página `RegisterPage.tsx`.
- `[x]` Integrar logotipo y cabecera en `RegisterPage`.
- `[x]` Agregar instancias de `AuthInput` (Nombre completo, Correo electrónico y Contraseña) en `RegisterPage`.
- `[x]` Implementar funciones de validación de inputs (campos requeridos, formato de correo, longitud de contraseña) en `RegisterPage`.
- `[x]` Enlazar el envío del formulario a la acción de registro del store en `RegisterPage`.
- `[x]` Añadir navegación SPA de retorno al login en `RegisterPage`.
- `[x]` Crear la estructura base de la página `LoginPage.tsx`.
- `[x]` Integrar logotipo y cabecera en `LoginPage`.
- `[x]` Agregar instancias de `AuthInput` (Correo electrónico y Contraseña) en `LoginPage`.
- `[x]` Implementar funciones de validación de campos en `LoginPage`.
- `[x]` Enlazar el envío del formulario a la acción de login en `LoginPage`.
- `[x]` Añadir navegación SPA de redirección al registro en `LoginPage`.

## Fase 4: Integración del Enrutador
- `[x]` Importar componentes reales de registro y login en `App.tsx`.
- `[x]` Reemplazar las vistas de marcadores provisionales por `RegisterPage` y `LoginPage` en las rutas `/register` y `/login`.
- `[x]` Configurar la posición y tema oscuro del contenedor global de notificaciones Toastify en `App.tsx`.
- `[x]` Configurar la opción Cerrar Sesión en `Sidebar.tsx` y limpiar estado global en Zustand (`HU-03`).

## Fase 5: Pruebas de Calidad, Responsividad y Accesibilidad
- `[x]` Probar el flujo de validaciones al enviar formularios vacíos y confirmar el despliegue de todos los errores.
- `[x]` Probar que los mensajes de error incluyan etiquetas descriptivas en el DOM (`aria-describedby` y `role="alert"`).
- `[x]` Probar que el botón de visibilidad de contraseña cambie correctamente el tipo de input de `password` a `text`.
- `[x]` Validar la responsividad de los formularios reduciendo la pantalla a resoluciones de dispositivos móviles (ancho completo con paddings laterales correctos).
- `[x]` Verificar el enrutamiento local sin recarga completa de página al usar los enlaces cruzados del pie de página.
- `[x]` Comprobar la redirección automática al feed principal tras un inicio de sesión correcto.
- `[x]` Validar el correcto renderizado de las iniciales del usuario (Avatar) en la cabecera tras autenticarse.
