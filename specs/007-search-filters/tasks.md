# Tasks: Filtrar reportes por categoría, tipo y fecha (HU-11)

- [x] Backend: Extender `JpaSpecificationExecutor` en `ReporteRepository.java`
- [x] Backend: Implementar la construcción dinámica de Specification en `ReportService.java`
- [x] Backend: Actualizar y ampliar el mapeo del endpoint en `ReportController.java`
- [x] Backend: Escribir pruebas unitarias en `ReportServiceTest.java` para filtros y fechas inválidas
- [x] Backend: Escribir prueba de integración en `ReportControllerIntegrationTest.java` para validar el endpoint con query parameters combinados de HU-11
- [x] Backend: Ejecutar `.\mvnw clean test` y verificar el paso exitoso de las 33 pruebas
- [x] Frontend: Definir e integrar la interfaz `ReportFilters` en `reportService.ts`
- [x] Frontend: Implementar el panel de filtros avanzados colapsable, selector multicategorías y rango de fechas en `FeedPage.tsx`
- [x] Frontend: Implementar botón de reseteo rápido para limpiar filtros y recargar todos los reportes
- [x] Frontend: Ejecutar `pnpm run build` y asegurar la compilación limpia de la aplicación React
