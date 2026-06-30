# Plan de Implementación: Feed de Reportes (Muro Principal)

**Historias de Usuario**:
- `HU-09` Feed de reportes
- `HU-10` Búsqueda de reportes

**Rama de Git**: `003-feed-dashboard`

## 1. Objetivo

El objetivo de este plan es construir el muro principal de reportes de objetos perdidos y encontrados (`/feed`) y estructurar la interfaz privada (DashboardLayout) con barra de navegación lateral y cabecera de usuario. El buscador del encabezado será integrado en el panel de herramientas de filtrado del contenido principal para optimizar la estética del sitio.

---

## 2. Contexto Técnico

- Lenguaje/Versión: TypeScript / HTML5 / CSS3.
- Framework Frontend: React + Vite (Single Page Application).
- Estilos: Tailwind CSS + CSS Vanilla para la animación de deslizamiento del menú móvil y sombras de tarjetas.
- Enrutamiento: React Router.
- Estado Global: Zustand (para consulta de sesión y usuario activo).
- Iconografía: Lucide React.
- Plataforma de Destino: Navegadores Web Modernos (Mobile-First).

---

## 3. Dependencias Principales

Las dependencias clave a utilizar para esta implementación son:
- `react-router`: Configuración del layout y anidación de rutas internas del panel privado.
- `zustand`: Consulta del estado del usuario logueado en el almacén de autenticación.
- `lucide-react`: Iconos representativos de categorías, pines de mapas e indicadores de tiempo.

---

## 4. Consideraciones Técnicas y Riesgos

- **Riesgo: Carga pesada de imágenes en el feed**: Cargar muchas imágenes de golpe puede ralentizar la pantalla.
  - *Mitigación*: Se implementará carga diferida (`loading="lazy"`) en las tarjetas y placeholders vectoriales para reportes que carezcan de fotografía.
- **Riesgo: Parpadeo en rutas protegidas**: Si el usuario accede a `/feed` directamente sin estar logueado.
  - *Mitigación*: El layout del dashboard comprobará el estado de sesión y redirigirá de inmediato a `/login` si no está autenticado, retornando nulo temporalmente para evitar renderizados erróneos.

---

## 5. Estructura del Proyecto (Archivos a modificar y crear)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx            <-- Barra lateral izquierda de navegación [NUEVO]
│   │   ├── DashboardLayout.tsx    <-- Estructura del panel con Sidebar y Topbar [NUEVO]
│   │   └── ReportCard.tsx         <-- Tarjeta individual para mostrar el reporte de objeto [NUEVO]
│   ├── pages/
│   │   └── FeedPage.tsx           <-- Pantalla principal del feed de objetos con filtros [NUEVO]
│   ├── App.tsx                    <-- Conexión de la ruta protegida /feed dentro del Layout [MODIFICAR]
│   └── index.css                  <-- Animaciones CSS de deslizamiento para menú móvil [MODIFICAR]
```

---

## 6. Cambios Propuestos

### Componentes de Estructura y UI

#### [NEW] `frontend/src/components/DashboardLayout.tsx`
- Layout principal para envolver las páginas privadas de la aplicación.
- Renderiza la barra lateral (`Sidebar`) a la izquierda (oculta en móviles, visible en escritorio).
- Renderiza la cabecera superior (`Topbar`) con campana de notificaciones y avatar del usuario.
- Implementa la barra lateral deslizante móvil con overlay traslúcido y botón de cierre.
- Redirige a `/login` si el usuario no tiene una sesión activa.

#### [NEW] `frontend/src/components/Sidebar.tsx`
- Desarrolla el menú lateral de opciones fijas.
- Mapea las rutas principales (Inicio, Crear reporte, Mis reportes, Coincidencias, Solicitudes, Mensajes, Administración).
- Implementa enlaces reactivos que destaquen visualmente la ruta en la que está posicionado el usuario.
- Agrega las opciones de perfil y cierre de sesión conectado al store global.

#### [NEW] `frontend/src/components/ReportCard.tsx`
- Componente de tarjeta para objetos perdidos y encontrados.
- Renderiza la imagen del reporte. En caso de no tener foto, despliega un fondo degradado con un icono representativo de la categoría.
- Muestra el distintivo flotante con el estado (perdido/encontrado) y los datos de título, categoría, ubicación y tiempo transcurrido.
- Agrega animaciones de hover con elevación y sombras interactivas.

### Páginas

#### [NEW] `frontend/src/pages/FeedPage.tsx`
- Diseña el encabezado de la sección y el botón de creación de nuevos reportes.
- Implementa el panel de búsqueda y filtrado:
  - Buscador local a la izquierda con un ancho delimitado.
  - Dropdowns interactivos para filtrar los datos por categoría y por tipo de objeto.
  - Indicador numérico de resultados filtrados.
- Integra la grilla de reportes que renderiza las tarjetas de forma dinámica a partir de la lista de objetos y los filtros aplicados.
- Contiene una lista de datos mock con imágenes reales y placeholders para simular contenido.

### Rutas y App

#### [MODIFICAR] `frontend/src/App.tsx`
- Importar `DashboardLayout` y `FeedPage`.
- Agrupar la ruta `/feed` dentro del layout del panel privado como ruta hija.

#### [MODIFICAR] `frontend/src/index.css`
- Definir la animación de deslizamiento para la barra lateral móvil al abrirse.

### 6.1. Orden de Implementación

1. Crear componentes base de interfaz (`Sidebar` y `DashboardLayout`).
2. Crear componentes de contenido (`ReportCard`).
3. Crear página de feed (`FeedPage`) integrando el buscador reubicado, los dropdowns y los datos simulados.
4. Actualizar el enrutador (`App.tsx`) para enlazar la ruta `/feed` con el layout y la nueva página.
5. Verificación visual.

---

## 7. Plan de Verificación

### Pruebas Manuales
- **Búsqueda e Integración**: Escribir en el buscador integrado en el contenido y verificar que la grilla reduzca las tarjetas de forma instantánea.
- **Dropdowns de Filtro**: Cambiar los filtros de categorías y tipos y asegurar que el listado se actualice y el contador cambie al total correcto.
- **Acceso Protegido**: Intentar ingresar directamente a `/feed` sin haber iniciado sesión y verificar que el sistema redirija inmediatamente a `/login`.
- **Menú Móvil**: Reducir el ancho de pantalla, verificar que la barra lateral se oculte y que se pueda abrir deslizando desde el botón de menú.
- **Cierre de Sesión**: Presionar el botón de cerrar sesión y verificar que el store limpie el token y el sistema redirija a la página de bienvenida.

---

## 8. Backend (Spring Boot)

### Tablas de Base de Datos
- `reportes` (id, usuario_id, categoria_id, tipo, nombre_objeto, descripcion, lugar, fecha_incidente, estado, created_at, updated_at)
- `categorias` (id, nombre, icono)
- `imagenes_reporte` (id, reporte_id, url_cloudinary, public_id_cloudinary, orden)

### Archivos Backend

| Capa | Archivo | Propósito |
|------|---------|-----------|
| Entidad | `model/Reporte.java` | Mapeo JPA de la tabla `reportes` |
| Entidad | `model/Categoria.java` | Mapeo JPA de la tabla `categorias` |
| Repositorio | `repository/ReporteRepository.java` | Paginación y búsqueda JPQL por palabra clave |
| Repositorio | `repository/CategoriaRepository.java` | Consultas de categorías |
| DTO Response | `dto/response/ReportResponse.java` | Proyección plana del reporte con imágenes |
| Servicio | `service/ReportService.java` | Feed paginado y búsqueda por palabra clave |
| Controlador | `controller/ReportController.java` | Endpoint GET /api/reports |
| Controlador | `controller/CategoriaController.java` | Endpoint GET /api/categorias |

### Endpoints

| Método | Ruta | HU | Descripción |
|--------|------|----|-------------|
| GET | `/api/reports?q=&page=&size=` | HU-09, HU-10 | Feed paginado con búsqueda opcional |
| GET | `/api/categorias` | Soporte | Listar categorías para filtros |
