# Tasks: Listar y marcar reportes como recuperados (HU-15 y HU-16)

- [ ] Backend: Implementar `resolveReport` en `ReportService.java`
- [ ] Backend: Registrar endpoint `PATCH /api/reports/{id}/resolve` en `ReportController.java`
- [ ] Backend: Añadir pruebas unitarias en `ReportServiceTest.java` para `resolveReport`
- [ ] Backend: Añadir pruebas de integración en `ReportControllerIntegrationTest.java` para `PATCH /api/reports/{id}/resolve`
- [ ] Backend: Ejecutar `.\mvnw.cmd clean test` y verificar éxito
- [ ] Frontend: Implementar `resolveReport` en `reportService.ts`
- [ ] Frontend: Modificar `MyReportsPage.tsx` para llamar a `resolveReport` con confirmación
- [ ] Frontend: Ejecutar `pnpm run build` y asegurar compilación limpia
- [ ] Verificación: Probar flujos en el navegador
