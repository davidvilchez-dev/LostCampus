# Tasks: Solicitudes de reclamación de propiedad y evidencias (HU-19, HU-20, HU-21)

**Input**: Design documents from `/specs/012-claim-requests/`

**Prerequisites**: plan.md (required), spec.md (required)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Database entities, repositories and DTO setup

- [ ] T001 Create `EstadoReclamacion` enum in `backend/src/main/java/com/david/backend/model/`
- [ ] T002 Create `SolicitudReclamacion` JPA entity in `backend/src/main/java/com/david/backend/model/`
- [ ] T003 Create `SolicitudReclamacionRepository` interface in `backend/src/main/java/com/david/backend/repository/`
- [ ] T004 Create `CreateClaimRequest` DTO in `backend/src/main/java/com/david/backend/dto/request/`
- [ ] T005 Create `ClaimResponse` DTO in `backend/src/main/java/com/david/backend/dto/response/`

**Checkpoint**: Foundational models and repository ready.

---

## Phase 2: Backend Implementation & Tests

**Purpose**: Service and Controller business logic for submitting, listing, and resolving claims, with unit and integration tests.

### Tests First (MANDATORY)
- [ ] T006 Create unit tests for `SolicitudReclamacionService` in `backend/src/test/java/com/david/backend/service/SolicitudReclamacionServiceTest.java` (Ensure they fail before service code exists or verify all edge cases).
- [ ] T007 Create integration tests for `SolicitudReclamacionController` in `backend/src/test/java/com/david/backend/controller/SolicitudReclamacionControllerIntegrationTest.java` (Ensure MockMvc endpoints return proper HTTP statuses).

### Service Implementation
- [ ] T008 Implement `SolicitudReclamacionService` logic in `backend/src/main/java/com/david/backend/service/SolicitudReclamacionService.java`
  - [ ] Implement `enviarSolicitud` with validations (not own report, only ENCONTRADO, active report, no duplicates).
  - [ ] Implement `listarEnviadas` and `listarRecibidas`.
  - [ ] Implement `aceptarSolicitud` (mark accepted, mark report as CERRADO, reject other claims on the same report).
  - [ ] Implement `rechazarSolicitud`.

### Controller Implementation
- [ ] T009 Implement `SolicitudReclamacionController` REST endpoints in `backend/src/main/java/com/david/backend/controller/SolicitudReclamacionController.java`

**Checkpoint**: Backend test suite compiles and runs successfully with `.\mvnw.cmd test`.

---

## Phase 3: Frontend Implementation

**Purpose**: Create frontend service client and views for the user dashboard and report detail page.

- [ ] T010 Create `claimService.ts` in `frontend/src/api/` to map claims endpoints.
- [ ] T011 Update `Navbar.tsx` in `frontend/src/components/` to add "Solicitudes" navigation link.
- [ ] T012 Create `ClaimsPage.tsx` in `frontend/src/pages/` to display sent and received claims.
  - [ ] Implement UI for received claims (claimant info, message evidence, Aceptar/Rechazar buttons).
  - [ ] Implement UI for sent claims (status badges, report link).
  - [ ] Add dialogs/drawers for confirmation and detail inspection.
- [ ] T013 Update `App.tsx` in `frontend/src/` to define the `/solicitudes` route pointing to `ClaimsPage`.
- [ ] T014 Modify `ReportDetailPage.tsx` in `frontend/src/pages/` to embed the "Reclamar Propiedad" button and the Modal for evidence input.
  - [ ] Validate evidence length (min 10 characters).
  - [ ] Manage button state (show "Reclamado (Pendiente)" if already submitted).

**Checkpoint**: Frontend Vite dev server builds and runs cleanly.

---

## Phase 4: Verification & Polish

**Purpose**: Verify the complete flow manually and check for code quality.

- [ ] T015 Run full test suite using `.\mvnw.cmd clean test` to ensure 100% success.
- [ ] T016 Run `pnpm run build` in `frontend` to verify successful client bundling.
- [ ] T017 Perform manual walkthrough on browser (creating claims, accepting claims, and validating report status shifts).
- [ ] T018 Write `walkthrough.md` with screenshots/recordings of the completed feature.
