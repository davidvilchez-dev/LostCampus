# Plan de Implementación: Solicitudes de reclamación de propiedad y evidencias (HU-19, HU-20, HU-21)

**Historias de Usuario**:

- `HU-19` Enviar solicitud de reclamación
- `HU-20` Gestionar solicitudes de reclamación recibidas
- `HU-21` Proveer información adicional de propiedad

**Rama de Git**: `012-claim-requests`

## 1. Objetivo

Implementar la infraestructura y vistas para la reclamación de objetos encontrados dentro del campus. Esto abarca desde la creación de la entidad en el backend y el guardado de la evidencia, hasta el panel de control del usuario para gestionar reclamos entrantes e interactuar con el reclamante mediante el intercambio de correos de contacto al aceptar la solicitud.

## 2. Estructura del Proyecto (Archivos a modificar y crear)

```text
backend/
├── src/main/java/com/david/backend/
│   ├── dto/
│   │   └── MatchResponse.java      <-- [NEW] DTO que extiende campos de reporte con score de similitud
│   ├── repository/
│   │   └── ReporteRepository.java  <-- [MODIFICAR] Añadir consulta de candidatos con filtros duros
│   ├── service/
│   │   └── ReportService.java      <-- [MODIFICAR] Implementar cálculo de score y búsqueda de coincidencias
│   ├── util/
│   │   └── SimilarityUtils.java    <-- [NEW] Utilidad para tokenización, eliminación de stop-words y Jaccard
│   └── controller/
│       └── ReportController.java   <-- [MODIFICAR] Agregar endpoint GET /api/reports/{id}/matches
└── src/test/java/com/david/backend/
    ├── service/
    │   └── ReportServiceTest.java  <-- [MODIFICAR] Pruebas unitarias para coincidencias
    └── controller/
        └── ReportControllerIntegrationTest.java <-- [MODIFICAR] Pruebas de integración del endpoint /matches

frontend/
├── src/
│   ├── api/
│   │   └── reportService.ts        <-- [MODIFICAR] Añadir getSuggestedMatches
│   └── pages/
│       └── ReportDetailPage.tsx    <-- [MODIFICAR] Cargar y renderizar la sección de coincidencias
```

## 3. Detalle de Cambios

### Backend (Spring Boot)

#### [NEW] `SimilarityUtils.java`

- Implementar tokenización en español (remoción de acentos, caracteres especiales, stop-words de una lista estática).
- Calcular coeficiente Jaccard: `intersection.size() / union.size()`.

#### [NEW] `MatchResponse.java`

- Contendrá todos los campos de `ReportResponse` más un campo `Double score` (porcentaje de coincidencia, ej: `82.5%`).

#### [MODIFY] `ReporteRepository.java`

- Agregar query `@Query` para retornar reportes de misma categoría, tipo opuesto, que no pertenezcan al mismo autor y estén activos.

#### [MODIFY] `ReportService.java`

- Implementar `getMatches(Usuario usuario, Long id)`:
  - Recuperar reporte de referencia. Validar que el usuario sea el propietario.
  - Cargar candidatos usando el repositorio.
  - Para cada candidato, calcular:
    - `textScore`: Jaccard de la combinación de nombre y descripción.
    - `placeScore`: Jaccard del campo lugar.
    - `timeScore`: Diferencia en días (de 0 a 30 días, linealizado a 1.0 - 0.0).
    - `totalScore = (textScore * 0.6) + (placeScore * 0.25) + (timeScore * 0.15)`.
  - Filtrar candidatos con `totalScore < 0.30`.
  - Convertir a `MatchResponse` (multiplicando score por 100 y redondeando).
  - Ordenar descendente y retornar.

#### [MODIFY] `ReportController.java`

- Exponer `@GetMapping("/{id}/matches")`.

### Frontend (React)

#### [MODIFY] `reportService.ts`

- Definir `MatchResponse` y exportar `getSuggestedMatches(id: number)`.

#### [MODIFY] `ReportDetailPage.tsx`

- Al cargar el reporte:
  - Si el usuario activo es el dueño, llamar a `getSuggestedMatches(id)`.
  - Renderizar una tarjeta o bloque de "Coincidencias Sugeridas".
  - Cada coincidencia debe mostrar la foto, nombre, lugar, fecha y el badge con el porcentaje (ej: `75% de coincidencia`).
  - Al hacer clic, navegar a la URL del reporte sugerido.

## 4. Plan de Verificación

### Pruebas Unitarias

- `ReportServiceTest.java`:
  - Validar cálculo correcto de score en diversos escenarios.
  - Verificar exclusión de reportes inactivos o del mismo autor.

### Pruebas de Integración

- `ReportControllerIntegrationTest.java`:
  - Probar `GET /api/reports/{id}/matches` confirmando estatus `200 OK` y formato de respuesta.

### Pruebas Manuales

1. Crear dos reportes relacionados (ej. uno perdido de "Llavero de cuero marrón" y otro encontrado de "Llavero de cuero con llaves").
2. Navegar al detalle de uno de ellos y comprobar la visualización de la sección "Coincidencias Sugeridas".
3. Verificar que al presionar la tarjeta navegue adecuadamente al reporte coincidente.
