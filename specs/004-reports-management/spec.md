# Especificación de Funcionalidad: Gestión de Reportes — Creación y Mis Publicaciones

**Historias de Usuario**:

- `HU-06` Crear reporte de objeto perdido
- `HU-07` Crear reporte de objeto encontrado
- `HU-08` Subir fotografías

**Rama de Git**: `004-reports-management`

**Creado**: `2026-06-29`

**Estado**: Completado

**Entrada**: Capturas de diseño de la interfaz de usuario para la pantalla de creación de reportes (con paneles de información, contexto y carga de imágenes) y para el panel de reportes personales (con estados activo, coincidencia y cerrado).

---

## 1. Escenarios de Usuario y Pruebas

### Escenario de Usuario 1 — Creación de reporte con datos completos (Prioridad: P1)

Como estudiante autenticado en el sistema, quiero registrar un objeto perdido o encontrado completando el formulario de reporte para que otros miembros de la comunidad universitaria lo visualicen.

**Por qué esta prioridad**: Es la funcionalidad principal del portal. Permite alimentar la base de datos de objetos extraviados y recuperados para iniciar búsquedas y coincidencias.

**Prueba Independiente**: Iniciar sesión, hacer clic en el botón de creación de reporte en el menú lateral, completar la sección de información principal, contexto y arrastrar al menos una imagen en la sección de evidencia. Hacer clic en publicar y verificar la alerta de confirmación y el redireccionamiento a la sección del feed o de mis reportes.

**Criterios de Aceptación**:

1. **Dado** que un usuario autenticado se encuentra en la pantalla de creación, **Cuando** se visualiza el formulario, **Entonces** el sistema debe presentar las secciones de Información Principal, Contexto y Evidencia Visual ordenadas en el espacio de trabajo.
2. **Dado** que el usuario selecciona el tipo de reporte, **Cuando** hace clic en "Perdí un objeto" o "Encontré un objeto", **Entonces** el control de tipo de reporte debe reflejar de forma exclusiva el botón activo seleccionado.
3. **Dado** que el usuario ingresa datos en los campos, **Cuando** completa el nombre del objeto, categoría, descripción detallada, fecha aproximada y ubicación, **Entonces** el sistema debe almacenar temporalmente los valores y validar que cumplan las restricciones antes del envío.
4. **Dado** que el usuario interactúa con la sección de evidencia visual, **Cuando** arrastra o selecciona archivos compatibles (PNG, JPG) de hasta un peso límite definido por imagen y un máximo de 3 imágenes, **Entonces** el sistema debe renderizar miniaturas previas de las fotos cargadas.
5. **Dado** que el usuario confirma la publicación, **Cuando** presiona el botón de envío y los datos son correctos, **Entonces** el reporte se guarda, se emite una notificación de éxito y se le redirige al listado correspondiente.
6. **Dado** que el usuario decide no completar el reporte, **Cuando** presiona el botón de cancelar, **Entonces** el sistema deshace los cambios y regresa a la pantalla anterior sin registrar información.

---

### Escenario de Usuario 2 — Consulta y gestión de reportes propios (Prioridad: P1)

Como usuario registrado, quiero ver una lista de mis publicaciones personales para consultar su estado actual y gestionar mis objetos reportados de forma independiente.

**Por qué esta prioridad**: El usuario necesita controlar el ciclo de vida de sus reportes, poder cancelarlos cuando encuentre su pertenencia o gestionar las interacciones de reclamo asociadas.

**Prueba Independiente**: Navegar a la sección de mis reportes y verificar que se visualicen únicamente las publicaciones registradas por el usuario logueado en una grilla ordenada, identificando los estados activo, coincidencia detectada y cerrado.

**Criterios de Aceptación**:

1. **Dado** que el usuario accede a la sección de mis reportes, **Cuando** la página carga, **Entonces** el sistema debe mostrar una grilla de tarjetas ordenada con un encabezado descriptivo y un botón de creación rápida.
2. **Dado** que el usuario visualiza sus tarjetas de reporte, **Cuando** un objeto se encuentra activo, **Entonces** la tarjeta debe mostrar un distintivo visual indicando el estado activo y controles para editar, resolver o eliminar.
3. **Dado** que un reporte ha detectado una coincidencia en el sistema, **Cuando** se despliega en la grilla, **Entonces** la tarjeta debe mostrar un distintivo con la alerta de coincidencia y los controles para verificarla.
4. **Dado** que un reporte se encuentra cerrado, **Cuando** se visualiza en el panel, **Entonces** la tarjeta debe mostrarse en tono apagado o de forma diferenciada indicando el estado cerrado y un control exclusivo para eliminar del historial.

---

## 2. Requisitos

### Requisitos Funcionales

- **RF-001 (Formulario de Creación de Reporte — `/reportar`)**:
  - **Panel de Información Principal**:
    - Selector exclusivo para definir el tipo de reporte ("Perdí un objeto" o "Encontré un objeto").
    - Campo de texto obligatorio para el nombre del objeto con sugerencia de ejemplo.
    - Selector desplegable obligatorio para elegir la categoría del objeto.
    - Área de texto para descripción detallada detallando señas particulares.
  - **Panel de Contexto**:
    - Selector de fecha aproximada del suceso.
    - Campo de entrada de texto obligatorio para la ubicación aproximada en el campus.
  - **Panel de Evidencia Visual**:
    - Área interactiva de arrastrar y soltar (drag and drop) archivos para imágenes.
    - Restricción visual de formatos admitidos y peso máximo por archivo.
    - Badge con indicación del límite de imágenes (máximo 3).
    - Fila inferior para previsualización de miniaturas de las imágenes cargadas.
  - **Acciones del Formulario**:
    - Botón destacado de ancho completo para publicar el reporte.
    - Botón de cancelación ubicado debajo de la publicación.

- **RF-002 (Panel de Publicaciones Propias — `/mis-reportes`)**:
  - Encabezado con título descriptivo y botón de creación de nuevos reportes.
  - Grilla de tarjetas estructurada según el tipo de estado del reporte:
    - Estado Activo: Imagen (o placeholder), título del objeto, fragmento de descripción, fecha de publicación y botones rápidos de edición, confirmación y borrado.
    - Estado Coincidencia Detectada: Distintivo de color de advertencia con la leyenda correspondiente y botones de acción.
    - Estado Cerrado: Tarjeta con atenuación visual de contenido, etiqueta descriptiva del motivo de cierre y botón exclusivo para limpiar el reporte del historial del usuario.

- **RF-003 (Validación e Integración de Archivos)**:
  - Validación del tamaño de cada archivo de imagen para asegurar que no supere el peso máximo.
  - Control de formatos de archivo restringiendo el proceso a imágenes compatibles.
  - Rechazar el envío del formulario si existen campos obligatorios vacíos y resaltar los campos con advertencias visuales en el cliente.

---

### Requisitos No Funcionales

- **RNF-001 (Consistencia de Diseño)**: Integrar las pantallas bajo el mismo esquema de colores oscuro, fuentes tipográficas y diseño de barra lateral que el feed de la aplicación.
- **RNF-002 (Adaptabilidad Responsiva)**:
  - El formulario de creación debe apilarse en una sola columna vertical en móviles, manteniendo las columnas de información y evidencia visual en paralelo en pantallas amplias.
  - La grilla de publicaciones personales debe reordenar sus columnas de forma inteligente según la resolución del cliente.
- **RNF-003 (Seguridad en la Carga)**: Validar la integridad de los archivos de imagen cargados en cliente antes de iniciar su procesamiento de red.

---

## 3. Criterios de Éxito

- **SC-001 (Validación de Formulario)**: El formulario de registro debe impedir el envío ante campos obligatorios vacíos, desplegando indicadores visuales correspondientes en el campo afectado de forma local.
- **SC-002 (Control de Evidencias)**: El control de carga de imágenes debe restringir la subida a un máximo de 3 elementos y previsualizar de forma inmediata las miniaturas seleccionadas.
- **SC-003 (Grilla y Filtro Personal)**: El listado de publicaciones propias debe filtrar la información del cliente para desplegar únicamente las tarjetas pertenecientes al usuario autenticado de forma ordenada.
- **SC-004 (Estados de Tarjetas)**: Las tarjetas de reportes propios deben renderizarse diferenciando visualmente sus tres estados operativos (activo, coincidencia y cerrado) mediante distintivos y controles específicos de acción.
