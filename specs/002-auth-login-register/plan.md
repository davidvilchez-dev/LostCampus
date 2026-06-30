# Plan de Implementación: Autenticación — Login y Registro

**Historias de Usuario**:
- `HU-01` Registro de usuario
- `HU-02` Iniciar sesión
- `HU-03` Cerrar sesión

## 1. Objetivo

Implementar las páginas de **Inicio de Sesión** (`/login`) y **Registro de Usuario** (`/register`) para LostCampus, reemplazando los placeholders en la configuración de rutas de la aplicación. Se estructurarán componentes de entrada reutilizables, validaciones visuales en los formularios y un almacén de sesión seguro para gestionar el acceso.

---

## 2. Contexto Técnico

- Lenguaje/Versión: TypeScript / HTML5 / CSS3.
- Framework Frontend: React + Vite (Single Page Application).
- Estilos: Tailwind CSS + CSS Vanilla para definir bordes y sombras interactivas.
- Enrutamiento: React Router.
- Estado Global: Zustand (para almacenar credenciales y estado de autenticación).
- Cliente HTTP: Axios.
- Notificaciones: React Toastify.
- Iconografía: Lucide React.
- Plataforma de Destino: Navegadores Web Modernos (Mobile-First).

---

## 3. Dependencias Principales

Las dependencias clave a utilizar para esta implementación son:
- `react-router`: Gestión de navegación y redirección entre `/login`, `/register` y `/feed`.
- `zustand`: Creación del almacén global de sesión del usuario.
- `axios`: Peticiones hacia los endpoints de registro y login.
- `react-toastify`: Emisión de notificaciones de éxito o credenciales erróneas.
- `lucide-react`: Iconos descriptivos para los inputs de los formularios.

---

## 4. Consideraciones Técnicas y Riesgos

- **Riesgo: Exposición de credenciales en el cliente**: Almacenar información delicada en texto plano puede ser inseguro.
  - *Mitigación*: El token y la información del perfil del usuario se mantendrán en memoria dentro del almacén global de Zustand y no se expondrán contraseñas en el estado.
- **Riesgo: Demoras en la respuesta de autenticación**: Si el backend tarda en validar, el usuario podría enviar el formulario varias veces.
  - *Mitigación*: Se inhabilitarán los botones de envío mientras la petición esté en progreso (`isLoading`).

---

## 5. Estructura del Proyecto (Archivos a modificar y crear)

```text
frontend/
├── src/
│   ├── components/
│   │   └── AuthInput.tsx          <-- Componente de entrada reutilizable con icono y error [NUEVO]
│   ├── pages/
│   │   ├── LoginPage.tsx          <-- Vista de inicio de sesión [NUEVO]
│   │   └── RegisterPage.tsx       <-- Vista de registro de usuario [NUEVO]
│   ├── store/
│   │   └── authStore.ts           <-- Almacén Zustand para credenciales y acciones [NUEVO]
│   ├── api/
│   │   └── authService.ts         <-- Funciones Axios para login y registro (mocks) [NUEVO]
│   ├── App.tsx                    <-- Conexión de rutas reales de acceso y registro [MODIFICAR]
│   └── index.css                  <-- Clases CSS de estilos y diseño del formulario [MODIFICAR]
```

---

## 6. Cambios Propuestos

### Componentes de UI compartidos

#### [NEW] `frontend/src/components/AuthInput.tsx`
- Componente de formulario parametrizable para admitir diferentes tipos de datos (nombre, correo, contraseña).
- Renderiza etiquetas estilizadas y un icono descriptivo en el extremo izquierdo.
- Soporta la integración de un botón interactivo a la derecha para alternar la visibilidad en campos de tipo clave.
- Muestra de manera condicional mensajes e indicadores visuales de error debajo del input.

### Páginas de Autenticación

#### [NEW] `frontend/src/pages/RegisterPage.tsx`
- Estructura un formulario centrado con el logotipo de la aplicación.
- Utiliza tres instancias de `AuthInput` (Nombre completo, Correo electrónico y Contraseña).
- Implementa validaciones al confirmar el envío (campos vacíos, estructura del correo, longitud mínima de contraseña).
- Desencadena el consumo del servicio de registro, notifica el resultado y redirige al inicio de sesión.
- Proporciona un enlace para usuarios ya registrados.

#### [NEW] `frontend/src/pages/LoginPage.tsx`
- Estructura un formulario de acceso centrado con el logotipo.
- Utiliza dos instancias de `AuthInput` (Correo electrónico y Contraseña).
- Valida los datos localmente antes de enviar la petición de inicio de sesión.
- Dispara la acción de autenticación en el store, almacena el token devuelto y redirige al panel privado.
- Muestra alertas en caso de credenciales incorrectas.

### Estado y Servicios

#### [NEW] `frontend/src/store/authStore.ts`
- Administra el estado global de autenticación (`user`, `token`, `isAuthenticated`, `isLoading`).
- Implementa acciones asíncronas para disparar las llamadas de inicio de sesión y registro del servicio de API.
- Controla el limpiado del estado de sesión al cerrar sesión.

#### [NEW] `frontend/src/api/authService.ts`
- Declara las llamadas HTTP de tipo POST para registrar y loguear usuarios.
- Implementa de forma transitoria respuestas de red simuladas (mock) con retardo de tiempo para permitir la navegación fluida hasta que el backend esté disponible.

### Estilos CSS

#### [MODIFICAR] `frontend/src/index.css`
- Definir la clase del contenedor de la tarjeta del formulario con fondo oscuro sólido y bordes sutiles.
- Definir clases para los inputs de autenticación (colores de fondo, bordes, estados de foco y estados de error con bordes destacados).
- Definir las transiciones y dimensiones de los botones de envío.

### Enrutamiento

#### [MODIFICAR] `frontend/src/App.tsx`
- Importar las nuevas pantallas `LoginPage` y `RegisterPage` sustituyendo las vistas provisionales.
- Actualizar el ruteador del cliente asignando las páginas reales a `/login` y `/register`.

### 6.1. Orden de Implementación

1. Estilos y clases CSS de autenticación en `index.css`.
2. Componente de entrada de datos reutilizable `AuthInput`.
3. Servicio de red `authService` con lógica simulada temporal.
4. Almacén de sesión `authStore` en Zustand.
5. Pantalla de creación de cuenta `RegisterPage`.
6. Pantalla de acceso de usuarios `LoginPage`.
7. Conexión de rutas en `App.tsx`.
8. Pruebas y validaciones funcionales.

---

## 7. Plan de Verificación

### Pruebas Manuales
- **Formularios Vacíos**: Enviar los formularios de registro y acceso vacíos y verificar que se muestre el 100% de los errores esperados.
- **Formato de Correo**: Ingresar direcciones sin el formato correspondiente y asegurar que salte la advertencia local.
- **Visibilidad de Contraseña**: Accionar el botón de ojo en el campo de contraseña y verificar que cambie la visibilidad de los caracteres.
- **Navegación e Inicio de Sesión**: Probar que las redirecciones automáticas y los enlaces SPA funcionen instantáneamente.
- **Responsividad**: Validar la visualización correcta de los formularios en móviles y escritorio.

---

## 8. Backend (Spring Boot)

### Tabla de Base de Datos
- `usuarios` (id, nombre_completo, correo, contrasena_hash, foto_url, es_admin, activo, token_recuperacion, token_expiracion, created_at, updated_at)

### Archivos Backend

| Capa | Archivo | Propósito |
|------|---------|-----------|
| Entidad | `model/Usuario.java` | Mapeo JPA de la tabla `usuarios` |
| Repositorio | `repository/UsuarioRepository.java` | Consultas: findByCorreo, existsByCorreo |
| DTO Request | `dto/request/RegisterRequest.java` | Validaciones para HU-01 |
| DTO Request | `dto/request/LoginRequest.java` | Validaciones para HU-02 |
| DTO Response | `dto/response/AuthResponse.java` | Envolver JWT + datos del usuario |
| DTO Response | `dto/response/UserResponse.java` | Proyección segura del usuario |
| Servicio | `service/AuthService.java` | Lógica de registro, login y hashing BCrypt |
| Controlador | `controller/AuthController.java` | Endpoints REST /api/auth/* |
| Seguridad | `security/JwtTokenProvider.java` | Generación y validación de tokens JWT |
| Seguridad | `security/JwtAuthenticationFilter.java` | Filtro de autenticación por Bearer token |
| Seguridad | `security/SecurityConfig.java` | Configuración de Spring Security |

### Endpoints

| Método | Ruta | HU | Descripción |
|--------|------|----|-------------|
| POST | `/api/auth/register` | HU-01 | Registrar nuevo usuario, retorna JWT |
| POST | `/api/auth/login` | HU-02 | Iniciar sesión, retorna JWT |

### HU-03: Cierre de Sesión
El cierre de sesión se maneja exclusivamente en el frontend (destrucción del token JWT en Zustand y redirección a `/login`). No requiere endpoint backend ya que la autenticación es stateless con JWT.
