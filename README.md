# Lost Campus 🏫🔍

Este proyecto es una aplicación web full-stack que consta de un **Backend en Spring Boot (Java)** y un **Frontend en React + TypeScript + Vite**.

A continuación se detallan las instrucciones paso a paso para que puedas configurar y ejecutar el proyecto en tu máquina local.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:
1. **Java JDK 17** (o superior).
2. **Node.js** (versión 18 o superior).
3. **PostgreSQL** (servidor de base de datos ejecutándose localmente).
4. Un gestor de paquetes de Node como **npm** (incluido con Node) o **pnpm** (recomendado).

---

## 💾 Paso 1: Configuración de la Base de Datos (PostgreSQL)

1. Abre tu cliente de base de datos preferido (pgAdmin, DBeaver, o la terminal psql).
2. Crea una nueva base de datos llamada `lostcampus_db`:
   ```sql
   CREATE DATABASE lostcampus_db;
   ```

---

## 🚀 Paso 2: Ejecución del Backend (Spring Boot)

1. Abre una terminal y navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Renombra o duplica el archivo de ejemplo para configurar tus credenciales locales:
   * Copia `src/main/resources/application.properties.example` y nómbralo `src/main/resources/application.properties`.
   * Abre `src/main/resources/application.properties` y configura las siguientes propiedades con tus credenciales de PostgreSQL, Cloudinary y Gmail:
     ```properties
     spring.datasource.username=TU_USUARIO_POSTGRES
     spring.datasource.password=TU_CONTRASEÑA_POSTGRES
     
     # Opcional (si usas Cloudinary para imágenes)
     cloudinary.cloud-name=TU_CLOUD_NAME
     cloudinary.api-key=TU_API_KEY
     ...
     ```
3. Ejecuta el backend usando el Maven Wrapper incluido en el proyecto:
   * **En Windows:**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   * **En Linux / macOS:**
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
   El backend iniciará por defecto en el puerto `8080`. Al iniciar por primera vez, Hibernate creará automáticamente la estructura de tablas necesaria en la base de datos `lostcampus_db`.

---

## 💻 Paso 3: Ejecución del Frontend (React)

1. Abre una nueva ventana de terminal y navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias necesarias:
   * Si usas **pnpm** (recomendado):
     ```bash
     pnpm install
     ```
   * Si usas **npm**:
     ```bash
     npm install
     ```
3. Inicia el servidor de desarrollo de Vite:
   * Si usas **pnpm**:
     ```bash
     pnpm dev
     ```
   * Si usas **npm**:
     ```bash
     npm run dev
     ```
4. Abre tu navegador y ve a la dirección indicada por la consola (generalmente `http://localhost:5173`).

---

## 📁 Estructura del Repositorio

* `/backend`: Código del backend desarrollado en Java con Spring Boot, JPA, Seguridad con JWT, y envío de correos electrónicos.
* `/frontend`: Código del frontend interactivo desarrollado con React, TypeScript, Leaflet (mapas) y Tailwind CSS.
* `schema.sql` (opcional): Si necesitas importar la base de datos manualmente, puedes generar y exportar el esquema en este archivo.
