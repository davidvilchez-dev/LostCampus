# Tareas de Implementación: Feed de Reportes (Muro Principal)

**Historias de Usuario**:
- `HU-09` Feed de reportes
- `HU-10` Búsqueda de reportes

**Rama de Git**: `003-feed-dashboard`

---

## Fase 1: Componentes del Panel (Sidebar & Layout)
- `[x]` Crear la estructura base del componente `Sidebar.tsx`.
- `[x]` Integrar el logotipo oficial con tipografía y enlaces consistentes en `Sidebar`.
- `[x]` Configurar el mapeo de enlaces del menú con iconos de Lucide (Inicio, Crear reporte, etc.).
- `[x]` Implementar el resaltado visual de la ruta activa usando estilos específicos para enlaces seleccionados en `Sidebar`.
- `[x]` Conectar la acción de cerrar sesión del almacén Zustand al botón de cierre en `Sidebar`.
- `[x]` Crear el componente layout principal `DashboardLayout.tsx`.
- `[x]` Configurar el bloque de enrutamiento anidado (`Outlet`) en `DashboardLayout`.
- `[x]` Diseñar la cabecera superior (Topbar) con icono de notificaciones y avatar del usuario logueado en `DashboardLayout`.
- `[x]` Implementar el control de apertura y cierre del menú móvil lateral en `DashboardLayout`.
- `[x]` Agregar clases CSS de animación de deslizamiento para el menú móvil (`animate-slide-in-left`) en `index.css`.
- `[x]` Añadir una redirección automática a la pantalla de acceso si el usuario no tiene sesión en `DashboardLayout`.

## Fase 2: Componentes del Feed (ReportCard)
- `[x]` Crear la estructura base del componente `ReportCard.tsx`.
- `[x]` Diseñar el contenedor de imagen del objeto con zoom interactivo al hacer hover.
- `[x]` Configurar la etiqueta flotante de estado ("Perdido" o "Encontrado") con colores y animación.
- `[x]` Programar una función que asigne iconos descriptivos basados en el nombre de la categoría del reporte.
- `[x]` Diseñar el bloque de información del reporte (título, categoría, lugar exacto con pin de mapa, fecha con icono de reloj).
- `[x]` Agregar el placeholder con gradiente y sombras en caso de que el reporte no tenga fotografía.
- `[x]` Configurar el efecto de brillo e iluminación en los bordes de la tarjeta al hacer hover.

## Fase 3: Página del Feed y Filtros (FeedPage)
- `[x]` Crear la estructura base de la página `FeedPage.tsx`.
- `[x]` Diseñar el bloque del encabezado de la sección con título y descripción del feed.
- `[x]` Agregar el botón destacado "+ Nuevo reporte" con redirección al formulario de creación.
- `[x]` Diseñar la barra de herramientas local para la búsqueda y filtrado de objetos.
- `[x]` Crear el input de búsqueda de texto integrado con un ancho proporcional delimitado.
- `[x]` Crear selectores desplegables para filtrar por categoría de objeto.
- `[x]` Crear selectores desplegables para filtrar por estado (perdido/encontrado).
- `[x]` Agregar un contador numérico reactivo que muestre el total de reportes resultantes.
- `[x]` Diseñar la grilla responsiva para ordenar las tarjetas de reportes.
- `[x]` Configurar una lista de datos mock completos para poblar el feed con imágenes representativas y descripciones.
- `[x]` Programar la lógica de filtrado dinámico en cliente (filtro por búsqueda de texto y selectores).
- `[x]` Diseñar una sección visual para cuando los filtros aplicados no devuelvan ningún reporte.

## Fase 4: Enrutamiento y Conexión
- `[x]` Importar `DashboardLayout` y `FeedPage` en el archivo de enrutamiento principal `App.tsx`.
- `[x]` Configurar la ruta `/feed` como ruta protegida hija de `DashboardLayout`.

## Fase 5: Pruebas de Calidad, Responsividad y Accesibilidad
- `[x]` Validar en navegador que la ruta `/feed` redirija a `/login` si no hay sesión activa.
- `[x]` Verificar que al escribir en el buscador local, la lista de tarjetas y el contador se actualicen instantáneamente en pantalla.
- `[x]` Verificar que los filtros combinados (buscador + dropdown categoría) funcionen correctamente en sincronía.
- `[x]` Validar la responsividad del menú lateral en móviles, confirmando que se oculte y abra desde el menú hamburguesa sin desbordamientos.
- `[x]` Validar la responsividad de las tarjetas en resoluciones móviles, tablets y escritorio.
- `[x]` Comprobar la navegación interna sin provocar recargas completas de la página HTML en todos los links del Sidebar.
- `[x]` Verificar la legibilidad y contraste del texto claro sobre el fondo oscuro en las tarjetas y barra de filtros.
