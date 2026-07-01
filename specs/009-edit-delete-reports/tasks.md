# Tasks: Editar y eliminar reportes propios (HU-13 y HU-14)

- [x] Backend: Implementar `updateReport` en `ReportService.java`
- [x] Backend: Implementar endpoint `PUT /api/reports/{id}` en `ReportController.java`
- [x] Backend: Añadir pruebas unitarias en `ReportServiceTest.java` para `updateReport` y `deleteReport`
- [x] Backend: Añadir pruebas de integración en `ReportControllerIntegrationTest.java` para `PUT` y `DELETE`
- [x] Backend: Ejecutar `.\mvnw.cmd clean test` y verificar éxito
- [x] Frontend: Implementar `updateReport` en `reportService.ts`
- [x] Frontend: Crear la página de edición `EditReportPage.tsx`
- [x] Frontend: Modificar `MyReportsPage.tsx` para navegar a la edición
- [x] Frontend: Modificar `ReportDetailPage.tsx` para mostrar los botones de Editar/Eliminar
- [x] Frontend: Registrar la ruta `/reporte/:id/editar` en `App.tsx`
- [x] Frontend: Ejecutar `pnpm run build` y asegurar compilación limpia
- [x] Verificación: Probar flujos en el navegador
