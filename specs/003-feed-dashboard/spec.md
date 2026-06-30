# Especificación de Funcionalidad: Feed de Reportes (Muro Principal)

**Historias de Usuario**:
- `HU-09` Feed de reportes
- `HU-10` Búsqueda de reportes

**Rama de Git**: `003-feed-dashboard`

**Creado**: `2026-06-27`

**Estado**: Borrador (Draft)

**Entrada**: Requisitos visuales para el muro del portal, catálogo de categorías de objetos y estados de publicación (perdido o encontrado).

---

## 1. Escenarios de Usuario y Pruebas

### Escenario de Usuario 1 — Exploración de objetos con filtros (Prioridad: P1)

Como estudiante registrado, quiero ver un muro con todas las publicaciones de objetos perdidos y encontrados, y poder filtrarlas por categoría, tipo o realizar búsquedas de texto para encontrar mis pertenencias.

**Por qué esta prioridad**: Es la pantalla central para localizar objetos. Permite a los usuarios consultar y buscar información de forma rápida.

**Prueba Independiente**: Cargar la pantalla de publicaciones, ingresar un término en el cuadro de búsqueda, interactuar con los selectores de categorías y tipos, y validar que la grilla de reportes se actualice de acuerdo a los criterios y que el indicador numérico de resultados muestre la cantidad correcta.

**Criterios de Aceptación**:
1. **Dado** que un usuario autenticado ingresa a la pantalla del feed, **Cuando** la página carga, **Entonces** se debe renderizar el menú lateral de navegación, la barra superior de usuario y la sección del contenido principal.
2. **Dado** que el usuario busca un objeto, **Cuando** escribe en el buscador integrado en el área de filtros, **Entonces** la lista debe actualizarse en tiempo real para mostrar los reportes que coincidan en título, descripción o lugar de extravío.
3. **Dado** que el usuario selecciona un filtro por tipo (perdido o encontrado), **Cuando** se aplica el filtro, **Entonces** las tarjetas que no correspondan se ocultan y el contador de resultados totales se actualiza.

---

### Escenario de Usuario 2 — Creación de Reporte y Navegación (Prioridad: P1)

Como estudiante, quiero presionar el botón de creación de reporte en la pantalla principal para dirigirme al formulario de publicación de objetos.

**Criterios de Aceptación**:
1. **Dado** que el usuario visualiza el muro principal, **Cuando** hace clic en el botón destacado de nuevo reporte, **Entonces** el sistema lo redirige a la pantalla del formulario de creación.
2. **Dado** que el usuario interactúa con las opciones del menú lateral, **Cuando** hace clic en una opción, **Entonces** la pantalla cambia al módulo seleccionado sin recargar el navegador.

---

## 2. Requisitos

### Requisitos Funcionales

* **RF-001 (Layout de Tres Secciones)**:
  - Barra Lateral de Navegación (Izquierda):
    - Logotipo oficial de la aplicación arriba.
    - Menú con enlaces (Inicio, Crear reporte, Mis reportes, Coincidencias, Solicitudes, Mensajes, Administración).
    - Divisor estético y opciones del pie de barra (Perfil, Cerrar sesión).
  - Barra Superior de Usuario (Topbar):
    - Sin barras de búsqueda principales.
    - Lado derecho: Control de notificaciones con alerta de novedad y avatar del perfil de usuario.
  - Contenedor Principal:
    - Encabezado con el título del feed y una breve explicación de uso.
    - Botón destacado de acción para crear reportes.

* **RF-002 (Integración del Buscador y Filtros)**:
  - El buscador de texto se debe ubicar de forma integrada en el mismo panel que los filtros de categorías y tipos.
  - El buscador de texto debe tener un ancho delimitado para no abarcar la pantalla completa.
  - Filtros interactivos con selectores desplegables para categorizar por tipo de objeto y por estado (perdido/encontrado).
  - Un indicador que muestre la cantidad total de reportes resultantes.

* **RF-003 (Grilla de Tarjetas de Objetos)**:
  - Grilla responsiva que ordene las tarjetas según la resolución del dispositivo.
  - Cada tarjeta informativa debe mostrar de forma clara:
    - Imagen de la evidencia o un gráfico placeholder representativo de la categoría si no posee foto.
    - Etiqueta superior que diferencie el estado (perdido o encontrado) con colores contrastantes.
    - Nombre del objeto, categoría con icono asociativo, lugar exacto del incidente y fecha o tiempo transcurrido de la publicación.
  - Efecto de iluminación en los bordes y elevación al posicionar el cursor sobre la tarjeta.

---

### Requisitos No Funcionales

* **RNF-001 (Consistencia Tipográfica)**: Todo el texto debe renderizarse bajo una tipografía uniforme y legible de alta densidad.
* **RNF-002 (Tema Oscuro Estructurado)**: Usar un fondo oscuro base uniforme con tarjetas y paneles en tonos oscuros diferenciados para dar contraste a la lectura.
* **RNF-003 (Responsividad)**: En dispositivos móviles, la barra lateral debe ocultarse y ser accesible mediante un botón de menú desplegable, y las tarjetas del feed deben apilarse ordenadamente.

---

## 3. Criterios de Éxito

* **SC-001 (Ubicación del Buscador)**: El buscador debe estar ubicado en la misma fila horizontal que los controles de filtrado dentro del área de contenido, dejando la barra superior libre de campos de búsqueda.
* **SC-002 (Navegación e Interacción)**: Los menús laterales, filtros y buscador deben reaccionar al clic y al ingreso de caracteres de forma inmediata, actualizando la vista sin recargar el navegador.
* **SC-003 (Grid Responsivo)**: El muro de reportes debe reorganizarse automáticamente adaptando las columnas en móviles, tablets y ordenadores sin solapamientos ni desbordamientos horizontales.
