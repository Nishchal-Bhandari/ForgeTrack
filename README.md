# ForgeTrack (v1.0.0-beta)
### Enterprise Attendance & Material Resource Planning (MRP) for The Forge

**ForgeTrack** is a robust, decoupled full-stack ecosystem designed to modernize academic operations for **The Forge AI-ML Engineering Bootcamp**. By integrating **Generative AI** for legacy data ingestion and implementing strict **Role-Based Access Control (RBAC)**, ForgeTrack transforms fragmented spreadsheets into a scalable, high-integrity data asset.

🚀 **Live Environment:** [forge-track-eight.vercel.app](https://forge-track-eight.vercel.app)

---

## 🏗️ System Architecture

ForgeTrack follows a modern **Decoupled Architecture** to ensure independent scalability of the presentation and logic layers.

*   **Presentation Layer:** A high-performance SPA built with React 18, leveraging **Atomic Design** principles for UI components.
*   **Application Layer:** A RESTful Node.js API utilizing **Express 5.x** for high-throughput request handling.
*   **Intelligence Layer:** Integrated **Google Gemini 2.0 Flash** agent for heuristic analysis and unpivoting of heterogeneous CSV datasets.
*   **Data Layer:** Distributed **MongoDB Atlas** cluster for schema-flexible yet strictly modeled document storage via Mongoose.

---

## 🛡️ Security & Governance

Enterprise-grade security is baked into the core of the platform:

*   **Authentication:** Stateless **JWT (JSON Web Tokens)** implementation with BcryptJS password hashing (cost factor: 10).
*   **Authorization:** Multi-tier RBAC (Role-Based Access Control) enforced at both the API gateway and the database query level.
*   **Data Integrity:** Transactional batch processing for AI-assisted imports to prevent partial data corruption (Atomic Operations).
*   **Environment Management:** Strict separation of secrets via environment-specific `.env` injection.

---

## 📁 Project Structure

```text
ForgeTrack/
├── backend/                # Logic Layer (Node.js/Express)
│   ├── src/
│   │   ├── middleware/     # Auth & Validation logic
│   │   ├── models/         # Mongoose Schemas (OOD)
│   │   ├── routes/         # REST Endpoints
│   │   └── server.js       # Entry point
│   └── seed.sql            # Legacy migration scripts
├── frontend/               # Presentation Layer (React/Vite)
│   ├── src/
│   │   ├── components/     # UI/UX Library (Atomic components)
│   │   ├── context/        # Global State Management
│   │   └── pages/          # View Controllers
│   └── tailwind.config.js  # Design System tokens
└── docs/                   # System Documentation & Specs
```

---

## ⚡ Quick Start (Developer Onboarding)

### 1. Prerequisite Audit
Ensure the following are installed: `Node.js v18.x`, `npm v9.x`, and a `MongoDB 6.0+` instance.

### 2. Environment Configuration
Create `.env` files in both `/backend` and `/frontend` based on the provided templates.

```bash
# Backend Audit
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/forgetrack
JWT_SECRET=your_32_char_secret_key
GEMINI_API_KEY=your_google_ai_key

# Frontend Audit
VITE_API_URL=https://api.yourdomain.com/api
```

### 3. Execution
```bash
# Install & Bootstrap
npm install && npm run dev:all
```

---

## 🛠️ Build & Release Pipeline

| Phase | Designation | Status | Objective |
| :--- | :--- | :--- | :--- |
| **P0** | **Foundation** | ✅ | Design Tokenization, Vite Scaffold, Atomic UI Baseline |
| **P1** | **Persistence** | ✅ | Mongoose Modeling, Transactional Seeding, Data Integrity Logic |
| **P2** | **App Shell** | ✅ | Dynamic Routing, Navigation State, Role-Aware Controllers |
| **P3** | **Mentor Core** | ✅ | Dashboard Analytics, Real-time Attendance, Material MRP |
| **P4** | **AI Agent** | ⏳ | **Gemini heuristic mapping** for pivoted CSV ingestion |
| **P5** | **Student Portal**| ⏳ | Self-scoped telemetry & Resource accessibility |
| **P6** | **Optimization** | ⏳ | E2E Testing, Performance Profiling, Deployment Hardening |

---

## 🧪 Quality Assurance & Testing

*   **Unit Testing:** Core utility functions and data parsers.
*   **Integration Testing:** API endpoint validation using Postman/Supertest.
*   **UI Testing:** Component-level testing with Vitest/Testing Library.
*   **User Acceptance (UAT):** Phase 6 validation against the **ForgeTrack Spec Sheet**.

---

## 🤝 Contribution Guidelines

We maintain high standards for code quality:
1. **ESLint/Prettier**: All code must pass the linting audit before PR.
2. **Commit Strategy**: Use **Conventional Commits** (e.g., `feat:`, `fix:`, `docs:`).
3. **Documentation**: Any change to API surface must be updated in `docs/`.

---

## 📜 Legal & Licensing
Developed by **BOPPL Pvt. Ltd.** for **The Forge Bootcamp**. All rights reserved. Proprietary software for academic administrative optimization.
