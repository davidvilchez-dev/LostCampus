# Tasks: Detección automática y consulta de coincidencias (HU-17 y HU-18)

- [ ] Backend: Crear `SimilarityUtils.java` para cálculo de Jaccard y stop-words
- [ ] Backend: Crear `MatchResponse.java` DTO
- [ ] Backend: Modificar `ReporteRepository.java` para consulta de candidatos
- [ ] Backend: Implementar `getMatches` en `ReportService.java`
- [ ] Backend: Registrar endpoint `GET /api/reports/{id}/matches` en `ReportController.java`
- [ ] Backend: Añadir pruebas unitarias en `ReportServiceTest.java`
- [ ] Backend: Añadir pruebas de integración en `ReportControllerIntegrationTest.java`
- [ ] Backend: Ejecutar `.\mvnw.cmd clean test` y verificar éxito
- [ ] Frontend: Implementar `getSuggestedMatches` en `reportService.ts`
- [ ] Frontend: Modificar `ReportDetailPage.tsx` para cargar y renderizar coincidencias
- [ ] Frontend: Ejecutar `pnpm run build` y asegurar compilación limpia
- [ ] Verificación: Probar flujos en el navegador
