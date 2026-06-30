# Especificación de Funcionalidad: Gestión de Perfil de Usuario

**Historias de Usuario**:
- `HU-04` Gestión de perfil

**Rama de Git**: `005-user-profile`

**Creado**: `2026-06-29`

**Estado**: Borrador (Draft)

**Entrada**: Requisitos funcionales de actualización de datos personales, carga de avatar y modificación de contraseña de la cuenta del estudiante.

---

## 1. Escenarios de Usuario y Pruebas

### Escenario de Usuario 1 — Modificación de información de perfil (Prioridad: P1)

Como estudiante registrado en LostCampus, quiero ingresar a la sección de perfil para consultar mis datos y modificar mi nombre completo, carrera y avatar para mantener mi información actualizada.

**Por qué esta prioridad**: Permite a otros usuarios de la comunidad reconocer de forma correcta al creador de un reporte al entablar contacto para la devolución de un objeto.

**Prueba Independiente**: Iniciar sesión, hacer clic en la opción de perfil en la barra lateral, cambiar los campos de nombre o carrera, seleccionar un nuevo avatar de la galería o de archivos y confirmar los cambios. Verificar la alerta de éxito y que los cambios se reflejen de inmediato en la barra superior.

**Criterios de Aceptación**:
1. **Dado** que un usuario autenticado se encuentra en la ruta `/perfil`, **Cuando** la página carga, **Entonces** el sistema debe renderizar el panel de información personal mostrando el avatar actual (o iniciales) y campos para nombre, correo (deshabilitado para edición) y carrera.
2. **Dado** que el usuario modifica su nombre o carrera, **Cuando** los campos cumplen con la validación de caracteres y se confirma el cambio, **Entonces** el sistema actualiza el estado global y muestra un toast de confirmación.
3. **Dado** que el usuario desea cambiar su foto, **Cuando** selecciona o carga un archivo de imagen compatible, **Entonces** el sistema muestra la nueva imagen previsualizada temporalmente en el círculo de perfil.

---

### Escenario de Usuario 2 — Actualización de contraseña por seguridad (Prioridad: P2)

Como usuario registrado, quiero cambiar mi contraseña desde mi perfil para mantener mi cuenta protegida.

**Prueba Independiente**: Ingresar a la sección de perfil, ubicar el formulario de cambio de clave, ingresar la contraseña actual, la nueva contraseña y su confirmación. Validar que al enviar se verifiquen los datos y se notifique el éxito.

**Criterios de Aceptación**:
1. **Dado** que el usuario visualiza el panel de seguridad de perfil, **Cuando** la página carga, **Entonces** el sistema debe mostrar campos para: Contraseña actual, Nueva contraseña y Confirmación de contraseña (con opción de visibilidad).
2. **Dado** que el usuario deja campos vacíos o la confirmación de la contraseña no coincide con la nueva, **Cuando** intenta enviar, **Entonces** el sistema debe denegar el envío y resaltar con borde rojo los campos afectados.
3. **Dado** que la nueva contraseña no cumple con la longitud mínima de caracteres, **Cuando** intenta enviar, **Entonces** el sistema debe mostrar una alerta de error por longitud insuficiente.
4. **Dado** que el usuario completa todos los campos de forma correcta, **Cuando** confirma el cambio, **Entonces** el sistema procesa el cambio de contraseña y limpia los campos del formulario.

---

## 2. Requisitos

### Requisitos Funcionales

* **RF-001 (Diseño de la Vista de Perfil — `/perfil`)**:
  - Estructurado en dos columnas para resoluciones de escritorio y apilado en móviles.
  - Columna Izquierda: Panel de Datos Personales.
  - Columna Derecha: Panel de Cambio de Contraseña.
* **RF-002 (Panel de Datos Personales)**:
  - Visualización del avatar del usuario en formato circular grande con borde de destaque.
  - Botón interactivo superpuesto para cargar o cambiar la imagen de perfil.
  - Campo de entrada para Nombre Completo (obligatorio, mínimo 3 caracteres).
  - Campo de entrada para Correo Electrónico (deshabilitado para edición).
  - Selector desplegable para Carrera Universitaria (por ejemplo: Ingeniería de Sistemas, Ingeniería Civil, Administración, Derecho, Educación, Medicina).
  - Botón destacado de confirmación para guardar datos de perfil.
* **RF-003 (Panel de Cambio de Contraseña)**:
  - Campos de entrada: Contraseña actual, Nueva contraseña y Confirmar nueva contraseña.
  - Botón de toggle (ojo) en cada campo de contraseña para mostrar/ocultar los caracteres de la clave.
  - Botón destacado de confirmación para actualizar la contraseña.
* **RF-004 (Validaciones locales)**:
  - Nombre completo: obligatorio, sin caracteres especiales no permitidos.
  - Contraseña nueva: longitud mínima de 6 caracteres.
  - Coincidencia de contraseña nueva y confirmación obligatoria.

---

### Requisitos No Funcionales

* **RNF-001 (Consistencia de Diseño)**: Mantener la consistencia estética con fondos oscuros, bordes estilizados, efectos hover en botones y tipografía Inter.
* **RNF-002 (Responsividad)**: Los paneles del perfil deben adaptarse a una sola columna en pantallas móviles para garantizar una lectura cómoda.
* **RNF-003 (Feedback Rápido)**: Proporcionar notificaciones visuales inmediatas sobre el resultado de las acciones realizadas.

---

## 3. Criterios de Éxito

* **SC-001 (Validaciones de Perfil)**: El formulario debe impedir el envío si el nombre es demasiado corto o las contraseñas no coinciden, marcando localmente los errores.
* **SC-002 (Persistencia Visual del Avatar)**: Al cargar una nueva imagen de perfil, el avatar del menú lateral y de la cabecera superior deben actualizarse dinámicamente con la nueva previsualización.
* **SC-003 (Actualización SPA)**: El envío de datos y la navegación de salida deben resolverse sin recargas completas de la página HTML.
