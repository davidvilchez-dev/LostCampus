# LostCampus Constitution

## Core Principles

### I. Decoupled Architecture

The system MUST follow a client-server architecture with strict separation of concerns.

- **Backend**: Spring Boot 4 + Java 25.
- **Frontend**: React 19.
- **Database**: PostgreSQL 16.
  Communication between components MUST occur exclusively via RESTful APIs.

### II. Service Testing Rigor

Every service class MUST have comprehensive unit tests.

- **Frameworks**: JUnit 5 and Mockito.
- **Rule**: Tests MUST be written and pass before any service is integrated or considered complete.
- **Rationale**: Ensure business logic reliability at the atomic level.

### III. Quality Gates (95% Coverage)

Code quality is non-negotiable and measured by strict coverage metrics.

- **Threshold**: Minimum 95% line coverage for all backend modules.
- **Tooling**: JaCoCo integrated into the Maven build lifecycle.
- **Enforcement**: Any build falling below this threshold MUST be rejected.

### IV. REST Integration Testing

All REST endpoints MUST be verified through integration tests.

- **Frameworks**: Spring Boot Test and MockMvc.
- **Requirement**: Tests must cover success paths, validation errors, and security constraints for every exposed resource.

### V. Cloud-Native Storage

Local server storage is strictly prohibited for user-generated content.

- **Provider**: Cloudinary.
- **Rule**: All images and media MUST be uploaded directly to Cloudinary.
- **Rationale**: Ensure statelessness and horizontal scalability of the application server.

### VI. Security-First Auth (JWT)

Authentication and authorization MUST be robust and stateless.

- **Mechanisms**: Spring Security with JSON Web Tokens (JWT).
- **Hashing**: All passwords MUST be hashed using BCrypt.
- **Requirement**: Secure token validation on every request to protected resources.

## Development Methodology

### Scrum & SDD Workflow

The project follows an Agile Scrum methodology with exactly 3 sprints of one-week duration each.

- **Framework**: Specification Driven Development (SDD) using the spec-kit framework.
- **Process**: All features must start with a specification, followed by a plan and task breakdown before implementation.

## Technical Constraints

### Environment & Tools

- **Runtime**: Java 25 / Node.js (current LTS for React).
- **Build**: Maven (Backend), Vite/pnpm (Frontend).
- **Infrastructure**: PostgreSQL 16, Cloudinary.
- **Communication**: REST / JSON.

## Governance

This constitution serves as the supreme guidance for the LostCampus project.

### Amendment Procedure

Changes to these principles require consensus from the development team and a corresponding version bump in this document.

### Compliance

All Pull Requests and automated build pipelines MUST verify adherence to these principles. Non-compliant code will not be merged.

**Version**: 1.0.0 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-06-24
