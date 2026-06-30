# Plan de Implementación: Gestión de Reportes — Creación y Mis Publicaciones

**Historias de Usuario**:
- `HU-06` Crear reporte de objeto perdido
- `HU-07` Crear reporte de objeto encontrado
- `HU-08` Subir fotografías

**Rama de Git**: `004-reports-management`

---

## 1. Objetivo

Implementar el flujo de creación de reportes de objetos perdidos y encontrados (`/reportar`) y el panel de administración personal (`/mis-reportes`). Esto incluye los formularios estructurados en dos columnas, validaciones locales, componente de arrastre de imágenes, previsualización de archivos y grilla de publicaciones personales con tarjetas en estados activo, coincidencia o cerrado.

---

## 2. Contexto Técnico

- Lenguaje/Versión: TypeScript / HTML5 / CSS3.
- Framework Frontend: React + Vite (Single Page Application).
- Estilos: Tailwind CSS + CSS Vanilla para estilos personalizados de bordes y estados.
- Enrutamiento: React Router.
- Estado Global: Zustand (para asociar la sesión activa al creador del reporte).
- Cliente HTTP: Axios (conexión preparada para envío multipart/form-data).
- Notificaciones: React Toastify.
- Iconografía: Lucide React.
- Plataforma de Destino: Navegadores Web Modernos (Mobile-First).

---

## 3. Dependencias Principales

Las dependencias clave a utilizar para esta implementación son:
- `react-router`: Enlace de las rutas `/reportar` y `/mis-reportes` dentro de la navegación privada de la aplicación.
- `zustand`: Asociación del usuario logueado en la sesión para el registro de los reportes.
- `axios`: Peticiones Multipart hacia el backend para el envío de datos de texto e imágenes.
- `react-toastify`: Mensajería para confirmar la creación de publicaciones o notificar errores de carga.
- `lucide-react`: Iconos para arrastre de archivos, pines de ubicación, calendarios, botones de edición y borrado.

---

## 4. Consideraciones Técnicas y Riesgos

- **Riesgo: Exceso de peso en imágenes**: La carga de fotos muy pesadas o en formatos no optimizados puede congestionar el servidor y fallar.
  - *Mitigación*: Se validará el tamaño (peso en bytes) y tipo mime del archivo en cliente antes de procesar el formulario, rechazando elementos no aptos con alertas Toastify.
- **Riesgo: Layout desestructurado en pantallas pequeñas**: El formulario con estructura de dos columnas puede verse saturado o colapsar en pantallas móviles de baja resolución.
  - *Mitigación*: Se implementará una grilla responsiva que fuerce el apilado vertical (`flex-col` o `grid-cols-1`) en pantallas de tamaño menor al umbral de escritorio, dando holgura al diseño.

---

## 5. Estructura del Proyecto (Archivos a modificar y crear)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ImageUploadDropzone.tsx <-- Zona de arrastre y selección de fotos [NUEVO]
│   │   └── MyReportCard.tsx        <-- Tarjeta con controles para reportes propios [NUEVO]
│   ├── pages/
│   │   ├── CreateReportPage.tsx    <-- Vista del formulario de creación [NUEVO]
│   │   └── MyReportsPage.tsx       <-- Vista del panel de reportes del usuario [NUEVO]
│   ├── App.tsx                    <-- Conexión de las nuevas rutas en el enrutador [MODIFICAR]
│   └── index.css                  <-- Estilos adicionales para la zona de arrastre [MODIFICAR]
```

---

## 6. Cambios Propuestos

### Componentes de UI

#### [NEW] `frontend/src/components/ImageUploadDropzone.tsx`
- Área interactiva con borde punteado para arrastrar y soltar archivos o seleccionarlos mediante cuadro de diálogo.
- Valida la cantidad máxima de 3 imágenes, los formatos admitidos (PNG, JPG) y el peso máximo por archivo.
- Genera y administra URLs temporales de previsualización para mostrar miniaturas de las fotos seleccionadas de inmediato.
- Muestra una fila de miniaturas y una opción para remover archivos de forma individual.

#### [NEW] `frontend/src/components/MyReportCard.tsx`
- Tarjeta de reporte adaptada para el panel personal.
- Renderiza distintivos del estado del objeto: activo (azul), coincidencia detectada (naranja) o cerrado (gris con opacidad atenuada).
- Muestra el nombre, descripción, fecha de publicación e iconos informativos.
- Despliega botones de acción rápida en la base según el estado:
  - Activo/Coincidencia: Botones para editar (icono lápiz), marcar como resuelto (icono check) y borrar (icono basurero).
  - Cerrado: Botón exclusivo para remover la tarjeta del historial de la cuenta.

### Páginas

#### [NEW] `frontend/src/pages/CreateReportPage.tsx`
- Implementa la interfaz del formulario de creación en dos columnas para pantallas amplias (columna izquierda para datos de texto, columna derecha para imágenes y envío).
- Muestra selectores de tipo de reporte ("Perdí un objeto" y "Encontré un objeto").
- Provee campos de entrada para el título, selector de categorías, descripción detallada, fecha aproximada (date input) y ubicación.
- Integra el componente `ImageUploadDropzone`.
- Maneja el envío validando la obligatoriedad de los campos clave y emitiendo el formulario en formato multipart.

#### [NEW] `frontend/src/pages/MyReportsPage.tsx`
- Diseña el panel personal de administración de publicaciones.
- Cabecera con título y botón de redirección rápida a la creación de reportes.
- Renderiza la grilla dinámica de tarjetas `MyReportCard` filtrando los reportes por el identificador del usuario autenticado.
- Contiene datos mock provistos con los tres estados definidos para validación visual de la interfaz.

### Rutas y App

#### [MODIFICAR] `frontend/src/App.tsx`
- Registrar las importaciones de `CreateReportPage` y `MyReportsPage`.
- Vincular las rutas `/reportar` y `/mis-reportes` dentro de la estructura de rutas hijas del enrutador privado.

---

### 6.1. Orden de Implementación

1. Crear el componente de carga y arrastre de imágenes `ImageUploadDropzone`.
2. Crear el componente de tarjeta personal `MyReportCard` estructurando las variantes de estado.
3. Desarrollar la pantalla del formulario de creación `CreateReportPage`.
4. Desarrollar la pantalla de administración personal `MyReportsPage` poblando los datos con mocks.
5. Registrar las nuevas rutas en `App.tsx`.
6. Validar visualmente la responsividad y funcionalidad en el navegador.

---

## 7. Plan de Verificación

### Pruebas Manuales
- **Acceso Directo**: Verificar que al acceder a `/reportar` o `/mis-reportes` sin iniciar sesión, el sistema redirija inmediatamente al login.
- **Validaciones de Creación**: Intentar enviar el formulario vacío y comprobar que se desplieguen los errores locales en los campos correspondientes.
- **Arrastre de Fotos**: Intentar arrastrar más de 3 fotos o archivos que no sean imágenes en `ImageUploadDropzone` y asegurar que el sistema lo rechace emitiendo una notificación de error.
- **Previsualización de Miniaturas**: Seleccionar 2 imágenes y confirmar que se muestren sus miniaturas en la sección derecha de la pantalla y que se puedan eliminar de forma independiente.
- **Grilla de Mocks**: Comprobar que en `/mis-reportes` se muestren las tres tarjetas mock correctamente estructuradas según sus estados operativos (activo, coincidencia y cerrado).
- **Adaptabilidad Responsiva**: Redimensionar la pantalla y asegurar el apilamiento vertical correcto de los formularios y la grilla de publicaciones personales.

---

## 8. Backend (Spring Boot)

### Tablas de Base de Datos
- `reportes` (id, usuario_id, categoria_id, tipo, nombre_objeto, descripcion, lugar, fecha_incidente, estado, created_at, updated_at)
- `imagenes_reporte` (id, reporte_id, url_cloudinary, public_id_cloudinary, orden)
- `categorias` (id, nombre, icono)

### Archivos Backend

| Capa | Archivo | Propósito |
|------|---------|-----------|
| Entidad | `model/Reporte.java` | Mapeo JPA de la tabla `reportes` con relaciones |
| Entidad | `model/ImagenReporte.java` | Mapeo JPA de la tabla `imagenes_reporte` |
| Repositorio | `repository/ReporteRepository.java` | CRUD y consultas de reportes |
| Repositorio | `repository/ImagenReporteRepository.java` | Consultas y conteo de imágenes (máx. 3) |
| DTO Request | `dto/request/CreateReportRequest.java` | Validaciones para creación de reporte |
| DTO Response | `dto/response/ReportResponse.java` | Proyección plana con URLs de imágenes |
| Servicio | `service/ReportService.java` | Creación de reportes y subida de imágenes |
| Servicio | `service/CloudinaryService.java` | Subida y eliminación de imágenes en Cloudinary |
| Controlador | `controller/ReportController.java` | Endpoints REST /api/reports/* |
| Configuración | `config/CloudinaryConfig.java` | Bean de Cloudinary con credenciales |

### Endpoints

| Método | Ruta | HU | Descripción |
|--------|------|----|-------------|
| POST | `/api/reports` | HU-06, HU-07 | Crear reporte (PERDIDO o ENCONTRADO) |
| POST | `/api/reports/{id}/images` | HU-08 | Subir imágenes a Cloudinary (máx. 3) |
| GET | `/api/reports/mine` | Soporte | Listar reportes del usuario autenticado |
| DELETE | `/api/reports/{id}` | Soporte | Eliminar reporte propio |

---

## 9. Pruebas Unitarias y de Integración Automatizadas

### Pruebas Unitarias (`ReportServiceTest.java`)
- **`createReport_Success`**: Valida que al enviar datos válidos se cree y guarde el reporte asignándole el usuario, categoría y estado `ACTIVO`.
- **`createReport_InvalidTipo_ThrowsException`**: Valida que arroje una excepción si el tipo no es `PERDIDO` o `ENCONTRADO`.
- **`uploadImages_Success`**: Verifica la subida física simulada de fotos con Cloudinary y su asociación correcta en base de datos.
- **`uploadImages_TooManyImages_ThrowsException`**: Asegura el cumplimiento de la regla de negocio que limita las imágenes a un máximo de 3 por reporte.
- **`deleteReport_Success`**: Comprueba que al eliminar un reporte se eliminen también sus imágenes asociadas tanto de la base de datos como de Cloudinary.
- **`deleteReport_UnauthorizedUser_ThrowsException`**: Valida que un usuario no pueda eliminar los reportes de otros usuarios.

### Pruebas de Integración (`ReportControllerIntegrationTest.java`)
- **`POST /api/reports` (Exitoso)**: Envía una petición autenticada de creación de reporte y valida estatus `201 Created` con los datos en formato JSON.
- **`DELETE /api/reports/{id}` (Exitoso)**: Ejecuta una petición HTTP para borrar un reporte propio y confirma que retorne un estatus `200 OK` con un mensaje de éxito.
