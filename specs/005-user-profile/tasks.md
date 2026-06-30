# Tareas de Implementación: Gestión de Perfil de Usuario

**Historias de Usuario**:
- `HU-04` Gestión de perfil

**Rama de Git**: `005-user-profile`

---

## Fase 1: Estructura de la Página y Diseño Base
- `[x]` Crear la estructura base de la página `ProfilePage.tsx`.
- `[x]` Diseñar el encabezado y subtítulo informativo en `ProfilePage`.
- `[x]` Configurar la grilla de dos columnas responsiva (datos personales a la izquierda, seguridad a la derecha) en `ProfilePage`.
- `[x]` Diseñar el bloque de avatar grande circular en `ProfilePage`.
- `[x]` Programar el cálculo de iniciales por defecto si el usuario no tiene foto en `ProfilePage`.
- `[x]` Diseñar el botón flotante e interacción para seleccionar imágenes locales de avatar en `ProfilePage`.

## Fase 2: Formulario de Datos Personales
- `[x]` Integrar los inputs de Nombre completo y Carrera universitaria (selector desplegable) en `ProfilePage`.
- `[x]` Integrar el input deshabilitado para visualización del correo del usuario en `ProfilePage`.
- `[x]` Programar la validación local de longitud de nombre e inhabilitado de botones durante el guardado en `ProfilePage`.
- `[x]` Vincular el botón de confirmación del formulario de datos con el almacén Zustand para persistir los cambios del usuario.

## Fase 3: Formulario de Seguridad (Contraseña)
- `[x]` Integrar los campos para Contraseña actual, Nueva contraseña y Confirmación de contraseña en `ProfilePage`.
- `[x]` Implementar el botón interactivo de visibilidad de caracteres (ojo) en cada campo de contraseña en `ProfilePage`.
- `[x]` Programar la lógica de validación de coincidencia de claves y longitud mínima en `ProfilePage`.
- `[x]` Vincular el botón de confirmación del formulario de seguridad con el envío asíncrono simulado.

## Fase 4: Enrutamiento y Conexión
- `[x]` Registrar la importación de `ProfilePage` en `App.tsx`.
- `[x]` Configurar la ruta `/perfil` como ruta protegida hija de `DashboardLayout`.
- `[x]` Asegurar que el componente `Sidebar.tsx` enlace correctamente a `/perfil` en la sección del pie de la barra lateral.

## Fase 5: Pruebas de Calidad, Responsividad y Accesibilidad
- `[x]` Probar en navegador la redirección automática al login si se accede a `/perfil` sin sesión activa.
- `[x]` Validar que al modificar el nombre y presionar guardar, los cambios se repliquen de forma inmediata en la cabecera (Topbar) y barra lateral (Sidebar) sin recarga del sitio.
- `[x]` Probar que los campos de contraseña validen correctamente la longitud y coincidencia de clave, desplegando los bordes rojos de error.
- `[x]` Validar la responsividad reduciendo la pantalla a dispositivos móviles (apilado a una sola columna vertical).
- `[x]` Comprobar que todos los inputs cuenten con etiquetas descriptivas semánticas y soporte de teclado para accesibilidad.
