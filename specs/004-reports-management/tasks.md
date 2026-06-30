# Tareas de Implementación: Gestión de Reportes — Creación y Mis Publicaciones

**Historias de Usuario**:
- `HU-06` Crear reporte de objeto perdido
- `HU-07` Crear reporte de objeto encontrado
- `HU-08` Subir fotografías

**Rama de Git**: `004-reports-management`

---

## Fase 1: Componentes de Interfaz Compartidos (Dropzone y Tarjetas)
- `[x]` Crear la estructura base del componente `ImageUploadDropzone.tsx`.
- `[x]` Implementar el área interactiva de arrastre de archivos y selección mediante clic en `ImageUploadDropzone`.
- `[x]` Programar las validaciones del archivo (peso menor a 5MB, tipo de formato JPG/PNG) en `ImageUploadDropzone`.
- `[x]` Configurar la generación de URL temporales para la previsualización de imágenes seleccionadas en `ImageUploadDropzone`.
- `[x]` Implementar el renderizado de la fila de miniaturas previas con botones para eliminarlas en `ImageUploadDropzone`.
- `[x]` Crear la estructura base del componente `MyReportCard.tsx`.
- `[x]` Diseñar los estilos visuales para los tres estados operativos (activo, coincidencia y cerrado) en `MyReportCard`.
- `[x]` Agregar iconos y campos de información (título, descripción, lugar, fecha) en `MyReportCard`.
- `[x]` Vincular los controles rápidos (editar, resolver, borrar) según el estado del reporte en `MyReportCard`.

## Fase 2: Pantalla de Creación de Reportes (CreateReportPage)
- `[x]` Crear la estructura base de la página `CreateReportPage.tsx`.
- `[x]` Diseñar el encabezado y descripción de ayuda en `CreateReportPage`.
- `[x]` Implementar los botones toggle para seleccionar el tipo de reporte ("Perdí un objeto" / "Encontré un objeto") en `CreateReportPage`.
- `[x]` Integrar los campos del panel de Información Principal (título, categoría, descripción detallada) en `CreateReportPage`.
- `[x]` Integrar los campos del panel de Contexto (fecha aproximada y ubicación) en `CreateReportPage`.
- `[x]` Crear el componente modal del mapa interactivo `CampusMapModal.tsx` con plano digital SVG.
- `[x]` Integrar el widget "Seleccionar en mapa" y conectar el modal en `CreateReportPage` para auto-completar el campo de ubicación.
- `[x]` Integrar el componente `ImageUploadDropzone` en la sección derecha de `CreateReportPage`.
- `[x]` Programar la lógica de envío validando la obligatoriedad de los campos e inhabilitando el botón mientras dura el envío en `CreateReportPage`.
- `[x]` Implementar el botón de cancelación con redirección SPA a la pantalla anterior en `CreateReportPage`.

## Fase 3: Pantalla de Publicaciones Propias (MyReportsPage)
- `[x]` Crear la estructura base de la página `MyReportsPage.tsx`.
- `[x]` Diseñar el encabezado del panel y el botón destacado "+ Nuevo reporte" en `MyReportsPage`.
- `[x]` Estructurar la grilla responsiva de tarjetas de reportes propios en `MyReportsPage`.
- `[x]` Configurar una lista de datos mock con reportes representativos en los tres estados operativos en `MyReportsPage`.
- `[x]` Programar la lógica que renderiza las tarjetas llamando a `MyReportCard` a partir de los datos en `MyReportsPage`.

## Fase 4: Enrutamiento y Conexión
- `[x]` Importar `CreateReportPage` y `MyReportsPage` en `App.tsx`.
- `[x]` Configurar las rutas `/reportar` y `/mis-reportes` dentro de las rutas del layout privado.
- `[x]` Modificar la navegación del menú lateral en `Sidebar.tsx` para vincular correctamente las opciones "Crear reporte" y "Mis reportes" con las nuevas rutas.

## Fase 5: Pruebas de Calidad, Responsividad y Accesibilidad
- `[x]` Probar en navegador la redirección automática al login si se accede a las rutas `/reportar` y `/mis-reportes` sin iniciar sesión.
- `[x]` Validar que al enviar el formulario vacío de creación de reporte se desplieguen los errores locales correspondientes.
- `[x]` Validar que el dropzone rechace archivos incompatibles de forma correcta y que se puedan borrar fotos añadidas individualmente.
- `[x]` Validar que al dar clic en publicar se muestre la confirmación visual en pantalla.
- `[x]` Probar el modal de plano de campus interactivo, confirmando que al hacer clic en las zonas se coloque el pin animado y se actualice el campo en el formulario.
- `[x]` Comprobar que en `/mis-reportes` se rendericen las tarjetas mock correctamente según sus estados (activo, coincidencia y cerrado).
- `[x]` Probar el menú de navegación lateral completo y que todas las opciones de rutas SPA funcionen sin provocar recarga de página HTML.
- `[x]` Validar la responsividad apilando las dos columnas a una sola en móviles.
- `[x]` Comprobar que los campos de entrada contengan etiquetas legibles y los errores utilicen tags semánticos para accesibilidad.
