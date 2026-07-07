# Especificación de Funcionalidad: Autenticación — Inicio de Sesión y Registro de Usuario

**Historias de Usuario**:

- `HU-01` Registro de usuario
- `HU-02` Inicio de sesión
- `HU-03` Cierre de sesión

**Rama de Git**: `002-auth-login-register`

**Creado**: `2026-06-27`

**Estado**: Completado

**Entrada**: Capturas de diseño de la interfaz de usuario, requisitos funcionales de validación y estructura de la entidad de usuarios de la base de datos.

---

## 1. Escenarios de Usuario y Pruebas

### Escenario de Usuario 1 — Registro de cuenta nueva (Prioridad: P1)

Como estudiante sin cuenta en la plataforma, quiero registrarme proporcionando mi nombre completo, correo electrónico y contraseña para acceder a las funcionalidades del sistema.

**Por qué esta prioridad**: Sin registro no hay usuarios dentro de la comunidad, lo cual imposibilita la creación y gestión de reportes de objetos.

**Prueba Independiente**: Cargar la pantalla de registro, completar todos los campos del formulario con datos válidos, presionar el botón de confirmación y verificar que se muestre una alerta de éxito y se dirija automáticamente a la pantalla de acceso.

**Criterios de Aceptación**:

1. **Dado** que un usuario no autenticado navega a la pantalla de registro, **Cuando** la página carga, **Entonces** el sistema debe renderizar el formulario con campos para el nombre completo, el correo electrónico y la contraseña, además del logotipo oficial.
2. **Dado** que el usuario deja campos vacíos e intenta enviar el formulario, **Cuando** hace clic en el botón de confirmación, **Entonces** el sistema debe resaltar visualmente los campos vacíos y mostrar mensajes de error específicos debajo de cada uno.
3. **Dado** que el usuario ingresa un correo con formato inválido, **Cuando** intenta enviar el formulario, **Entonces** el sistema debe mostrar un mensaje de error por formato inválido en dicho campo.
4. **Dado** que el usuario ingresa una contraseña menor al límite mínimo de caracteres, **Cuando** intenta enviar el formulario, **Entonces** el sistema debe advertir sobre la longitud mínima del campo.
5. **Dado** que el usuario completa todos los campos con datos correctos, **Cuando** confirma el envío, **Entonces** el sistema procesa el registro y redirige a la pantalla de inicio de sesión.

---

### Escenario de Usuario 2 — Inicio de sesión con credenciales (Prioridad: P1)

Como estudiante registrado, quiero iniciar sesión con mi correo y contraseña para poder acceder a mis publicaciones y al listado de objetos perdidos.

**Por qué esta prioridad**: Es el mecanismo para validar la identidad y permitir el acceso a las funciones interactivas del sistema.

**Prueba Independiente**: Cargar la pantalla de inicio de sesión, ingresar credenciales de prueba válidas, presionar el botón de acceso y verificar que se inicie sesión y se redirija al muro principal.

**Criterios de Criterios de Aceptación**:

1. **Dado** que un usuario no autenticado navega a la pantalla de acceso, **Cuando** la página carga, **Entonces** se debe mostrar el formulario con campos para correo electrónico y contraseña junto al logotipo.
2. **Dado** que el usuario deja campos vacíos e intenta ingresar, **Cuando** presiona el botón de acceso, **Entonces** el sistema resalta los campos con error y muestra las advertencias correspondientes.
3. **Dado** que el usuario ingresa credenciales válidas, **Cuando** presiona el botón de acceso, **Entonces** el sistema establece la sesión del usuario y redirige al feed principal.
4. **Dado** que el usuario ingresa credenciales inválidas, **Cuando** el sistema procesa la petición de acceso, **Entonces** se debe alertar al usuario sobre el fallo de autenticación a través de una notificación en pantalla.

---

### Escenario de Usuario 3 — Navegación entre Login y Registro (Prioridad: P2)

Como usuario visitante, quiero poder alternar fácilmente entre las pantallas de registro e inicio de sesión.

**Prueba Independiente**: Verificar que los enlaces para cambiar de pantalla redirijan de forma inmediata entre el registro y el inicio de sesión sin recargar la página completa.

**Criterios de Aceptación**:

1. **Dado** que el usuario está en la pantalla de registro, **Cuando** hace clic en la opción de iniciar sesión, **Entonces** el sistema lo redirige a la pantalla de inicio de sesión.
2. **Dado** que el usuario está en la pantalla de inicio de sesión, **Cuando** hace clic en la opción de crear cuenta, **Entonces** el sistema lo redirige a la pantalla de registro.

---

### Escenario de Usuario 4 — Cerrar sesión para proteger la cuenta (Prioridad: P1)

Como usuario autenticado en LostCampus, quiero poder cerrar mi sesión activa en cualquier momento para evitar el acceso no autorizado a mis reportes o mensajes.

**Prueba Independiente**: Desde el dashboard o cualquier sección privada, hacer clic en el botón de cerrar sesión ubicado en la barra lateral. Verificar que el sistema destruya la sesión, muestre una alerta de confirmación y redirija al usuario a la pantalla de bienvenida o inicio de sesión.

**Criterios de Aceptación**:

1. **Dado** que el usuario tiene una sesión activa, **Cuando** hace clic en "Cerrar sesión" en la barra lateral, **Entonces** el sistema limpia las variables locales de sesión en Zustand.
2. **Dado** que la sesión ha sido destruida, **Cuando** el usuario intenta navegar a `/feed` u otra ruta privada, **Entonces** el sistema debe denegar el acceso y redirigir a `/login`.

---

## 2. Requisitos

### Requisitos Funcionales

- **RF-001 (Página de Registro)**:
  - Logotipo del sistema centrado en la parte superior.
  - Tarjeta central oscura con esquinas redondeadas para el formulario.
  - Campos del formulario etiquetados y ordenados de la siguiente forma:
    - Nombre completo: Con un indicador visual descriptivo.
    - Correo electrónico: Con un indicador de tipo correo.
    - Contraseña: Con un indicador de seguridad y opción para mostrar/ocultar los caracteres de la clave.
  - Estado de error: Resaltado visual en los bordes del input y mensaje explicativo debajo del campo afectado.
  - Botón de confirmación destacado y de ancho completo.
  - Enlace rápido inferior para redirigirse a la pantalla de inicio de sesión.
- **RF-002 (Página de Inicio de Sesión)**:
  - Estructura visual análoga a la página de registro.
  - Campos para correo electrónico y contraseña (esta última con opción de ocultar/mostrar caracteres).
  - Botón de acceso destacado de ancho completo.
  - Enlace rápido inferior para redirigirse a la pantalla de registro.
- **RF-003 (Validación en Cliente)**:
  - La validación de los datos ingresados debe dispararse al intentar enviar el formulario.
  - El campo de nombre completo requiere una longitud mínima para evitar nombres incompletos.
  - El campo de correo electrónico debe estructurarse bajo un formato válido.
  - La contraseña requiere cumplir con la longitud mínima de seguridad.
  - Los errores visuales deben limpiarse en cuanto el usuario corrija los campos y vuelva a intentar la acción.
- **RF-004 (Lógica de Sesión)**:
  - Gestión centralizada del estado de autenticación (usuario activo, token y estado de sesión).
  - Preparación de servicios de red con soporte para respuestas simuladas para permitir el desarrollo independiente.

---

### Requisitos No Funcionales

- **RNF-001 (Consistencia de Diseño)**: Mantener la misma paleta de colores oscuros, tipografía y transiciones interactivas que el resto del portal público.
- **RNF-002 (Responsividad)**: Los formularios deben centrarse en resoluciones amplias y ocupar el ancho total de la pantalla con márgenes adecuados en dispositivos móviles.
- **RNF-003 (Accesibilidad)**: Todos los campos de entrada de datos deben incluir etiquetas descriptivas legibles y asociar los mensajes de error correspondientes para lectores de pantalla.

---

## 3. Criterios de Éxito

- **SC-001 (Validación Completa)**: El sistema debe rechazar el envío del formulario y resaltar visualmente el 100% de los campos con datos erróneos u obligatorios vacíos.
- **SC-002 (Navegación SPA)**: Los enlaces de navegación cruzada entre acceso y registro deben responder de forma instantánea sin provocar una recarga forzada del sitio.
- **SC-003 (Fidelidad del Formulario)**: Las pantallas deben renderizar de forma completa todos los campos del formulario requeridos, visualizando correctamente los iconos, la opción de visibilidad de clave y los bordes de error bajo las condiciones descritas.
- **SC-004 (Estado de Sesión)**: El almacén de sesión debe actualizar y conservar el estado de autenticación tras un inicio de sesión correcto.
