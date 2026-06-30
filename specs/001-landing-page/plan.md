# Plan de Implementación: Landing Page (Página de Bienvenida)

**Historias de Usuario**:
- N/A (Estructura de Bienvenida e Inicio del Portal)

## 1. Objetivo

El objetivo de este plan es construir la interfaz pública de bienvenida de **LostCampus** para la universidad. Se implementará una interfaz estática responsiva con un tema oscuro uniforme, utilizando componentes modulares para secciones clave (Navbar, Hero, Features, Footer) y enlazando las rutas iniciales correspondientes.

---

## 2. Contexto Técnico

- Lenguaje/Versión: TypeScript / HTML5 / CSS3.
- Framework Frontend: React + Vite (Single Page Application).
- Estilos: Tailwind CSS + CSS Vanilla para micro-animaciones personalizadas y transparencias.
- Enrutamiento: React Router (gestión de rutas locales en el lado del cliente).
- Estado Global: Zustand (preparación del almacén base para datos de sesión).
- Cliente HTTP: Axios (configuración de instancia con interceptores de tokens).
- Notificaciones: React Toastify.
- Iconografía: Lucide React.
- Assets Visuales: Logotipo institucional y gráficos del Hero.
- Plataforma de Destino: Navegadores Web Modernos (Mobile-First).

---

## 3. Dependencias Principales

Para el desarrollo del frontend de LostCampus, utilizaremos las siguientes librerías de producción:

- `react-router`: Para el manejo de la navegación interna de la aplicación (SPA).
- `zustand`: Para almacenar y persistir el estado de autenticación de forma ligera.
- `axios`: Para gestionar peticiones asíncronas hacia la API.
- `react-toastify`: Para proveer notificaciones visuales y feedback rápido.
- `lucide-react`: Para proveer iconos vectoriales limpios y consistentes.

---

## 4. Consideraciones Técnicas y Riesgos

- **Riesgo: Parpadeo de rutas protegidas**: Si Zustand no carga a tiempo el estado desde el almacenamiento local, se podría redirigir incorrectamente al Login.
  - _Mitigación_: Se implementará un estado de carga inicial en la validación del Layout.
- **Riesgo: Optimización de Imágenes**: Cargar recursos gráficos pesados puede ralentizar el rendimiento inicial.
  - _Mitigación_: Se usarán formatos de imagen optimizados de última generación y carga diferida (lazy loading).

---

## 5. Estructura del Proyecto (Archivos a modificar y crear)

A continuación se detalla la distribución de archivos para esta característica en la carpeta `frontend/`:

```text
frontend/
├── src/
│   ├── assets/
│   │   ├── logo.png                <-- Logotipo oficial de LostCampus
│   │   └── hero-illustration.png   <-- Ilustración de bienvenida
│   ├── components/
│   │   ├── Navbar.tsx             <-- Barra de navegación superior [NUEVO]
│   │   ├── Hero.tsx               <-- Sección principal de bienvenida [NUEVO]
│   │   ├── Features.tsx           <-- Sección de tarjetas informativas [NUEVO]
│   │   └── Footer.tsx             <-- Pie de página con enlaces [NUEVO]
│   ├── pages/
│   │   └── LandingPage.tsx        <-- Página contenedora principal [NUEVO]
│   ├── store/
│   │   └── authStore.ts           <-- Almacén Zustand para autenticación [NUEVO]
│   ├── api/
│   │   └── axiosClient.ts         <-- Cliente Axios con configuración de interceptores [NUEVO]
│   ├── App.tsx                    <-- Definición de enrutador y componentes globales [MODIFICAR]
│   ├── index.css                  <-- Estilos globales y clases de efectos avanzados [MODIFICAR]
│   └── main.tsx                   <-- Punto de entrada de la aplicación
```

---

## 6. Cambios Propuestos

### A. Estilos y Configuración Base

#### [MODIFICAR] `frontend/src/index.css`

- Integrar la configuración base del motor de estilos y definir variables de tema.
- Crear clases CSS personalizadas para efectos visuales avanzados (desenfoque traslúcido de contenedores y resplandores en botones) para no saturar los componentes con clases utility extensas.
- Definir las micro-animaciones globales de flotación y transiciones de elementos interactivos.

### B. Módulos y Estado Global

#### [NUEVO] `frontend/src/store/authStore.ts`

- Implementar la estructura del store de autenticación utilizando Zustand.
- Definir variables para almacenar tokens y datos de usuario en sesión.
- Proporcionar funciones para actualizar y borrar el estado de inicio de sesión de forma centralizada.

#### [NUEVO] `frontend/src/api/axiosClient.ts`

- Configurar el cliente HTTP Axios estableciendo la dirección base de red.
- Implementar un interceptor de peticiones que compruebe la presencia del token en el store de Zustand y lo inyecte automáticamente en el encabezado de autorización.

### C. Componentes de la Interfaz (React 19)

#### [NUEVO] `frontend/src/components/Navbar.tsx`

- Desarrollar la barra de navegación superior con efecto de fondo traslúcido y posición fija.
- Mostrar el logotipo del portal y los enlaces informativos.
- Proveer un botón destacado para Iniciar sesión con retroalimentación visual al hacer hover.

#### [NUEVO] `frontend/src/components/Hero.tsx`

- Crear el componente principal dividido en dos columnas para pantallas de escritorio y apilado vertical en dispositivos móviles.
- Mostrar textos informativos, llamadas a la acción y botones enlazados a los formularios.
- Integrar la ilustración promocional.

#### [NUEVO] `frontend/src/components/Features.tsx`

- Construir una cuadrícula de cuatro tarjetas informativas que describan los beneficios de la aplicación.
- Añadir iconos consistentes y transiciones dinámicas al pasar el cursor sobre las tarjetas.

#### [NUEVO] `frontend/src/components/Footer.tsx`

- Implementar la sección del pie de página con enlaces de contacto e información de derechos de autor.

### D. Enrutamiento

#### [MODIFICAR] `frontend/src/App.tsx`

- Configurar el enrutador a nivel de cliente para gestionar la navegación.
- Declarar las rutas públicas iniciales `/`, `/login` y `/register`, asociándolas a sus vistas correspondientes.
- Configurar el contenedor global de notificaciones.

### 6.1. Orden de Implementación

1. Configurar dependencias e index.css base con estilos utilitarios y efectos de transparencia.
2. Crear el store Zustand `authStore` y configurar el cliente Axios con interceptores.
3. Desarrollar componentes UI: Navbar, Hero, Features, Footer.
4. Crear la página contenedora LandingPage y ensamblar los componentes.
5. Modificar App.tsx para enlazar las rutas del enrutador React Router.
6. Compilar y verificar el funcionamiento local en móviles y escritorio.

---

## 7. Plan de Verificación

### Pruebas Manuales

1. **Verificación de Enrutamiento**: Hacer clic en los botones del Navbar y Hero y comprobar la correcta redirección en la barra de direcciones sin provocar recarga de página HTML.
2. **Validación Visual de Adaptabilidad**: Redimensionar la pantalla y asegurar que los componentes de Navbar (menú móvil) y Features se apilen correctamente sin desbordamientos.
3. **Compilación de Producción**: Compilar el código del cliente para asegurar la ausencia de advertencias tipográficas o de estilos.
