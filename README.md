# 📚 Online Library System — Software Deployment, Maintenance & Project Closure

An enterprise-grade, full-stack **Node.js** web application and academic assignment submission suite designed for the **Online Library System** case study (Group Work: 3–5 Students).

---

## 🎨 Design & Aesthetic Highlights
- **Ultra-Thin Borders**: Refined `0.5px` precision borders (`ultra-border`, `ultra-border-yellow`, `ultra-border-yellow-glow`) across all cards, gauges, tables, and dividers.
- **3D Icons & Depth**: Custom isometric 3D SVG icon containers with layered gradients, drop-shadow reflections, and tilt hover effects.
- **Color Palette**: Radiant **Yellow** (`#FACC15`, `#EAB308`, `#FEF08A`) and pure **White** (`#FFFFFF`) with deep obsidian surfaces (`#0A0D14`) for maximum visual contrast and luxury engineering feel.
- **Typography**: **Plus Jakarta Sans** loaded globally for geometric clarity and modern legibility.

---

## 👥 Group Identification (3–5 Students)
| Student Name | Student ID | Assigned Project Role | 5-Minute Presentation Segment |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | STU-ADM-8841 | Lead Software Architect | **Minute 0:00 – 1:00**: Intro & Task 1 Deployment Strategy |
| **Sarah Chen** | LIB-OPS-8842 | DevOps & Release Engineer | **Minute 1:00 – 2:00**: Task 2 Pre-Deployment Checklist Gates |
| **Jordan Taylor** | STU-2026-8843 | Site Reliability Engineer (SRE) | **Minute 2:00 – 3:00**: Task 3 Incident Rollback Protocol |
| **Marcus Vance** | ENG-DEV-8844 | Core Software Engineer | **Minute 3:00 – 4:00**: Task 4 Software Maintenance Quadrants |
| **Elena Rostova** | PRJ-MGT-8845 | Project Manager & Scrum Master | **Minute 4:00 – 5:00**: Task 5 Monitoring & Project Handover |

---

## 📋 Comprehensive Assignment Deliverables (All 5 Tasks)

### 🚀 Task 1: Deployment Strategy Selection & Justification
- **Chosen Strategy**: **Blue-Green Deployment**
- **Justification**:
  1. **Zero Downtime**: The Online Library System experiences severe load peaks prior to midnight assignment deadlines and semester exams. Blue-Green guarantees 100% availability by maintaining two identical production clusters; the router/load balancer points incoming traffic to Green without dropping active student sessions.
  2. **Instant Rollback Capability**: If an undiscovered defect emerges in production, reverting back to Blue takes under 30 seconds by simply modifying the router pointer, avoiding tedious container redeployments.
  3. **Isolated Production Staging**: The new release is fully smoke-tested against live database replicas in production-grade infrastructure before receiving real traffic.
  4. **Comparison**: *Big-bang* induces high outage risk; *Rolling* creates partial schema version mismatches and database lock contention; *Canary* requires complex traffic routing heuristics not necessary for this application scale.

---

### ✅ Task 2: Pre-Deployment Checklist (5 Important Activities)
1. **Automated Database Migration & Schema Dry-Run**:
   - *Example*: Execute forward and rollback migration scripts on a sanitized staging replica containing 120,000 book records. Validate that foreign keys (`borrows.userId -> users.id`) and availability check constraints hold without table locks.
2. **Security & Penetration Audit (OWASP Top-10 & RBAC)**:
   - *Example*: Run automated DAST scans using OWASP ZAP to test for SQL/NoSQL injection, enforce HTTPS/TLS 1.3, verify JWT token signing algorithms, and confirm students cannot access administrative book management APIs.
3. **Concurrency & Stress Load Testing**:
   - *Example*: Simulate 5,000 concurrent students performing catalog lookups and simultaneous checkout requests using k6. Confirm p95 API response times remain under 200ms and connection pool utilization remains below 80%.
4. **End-to-End User Acceptance Testing (UAT) Sign-Off**:
   - *Example*: Conduct UAT with the Chief Librarian and student representatives to validate 18 core workflows: searching catalog, borrowing books, returning loans, fine calculation, and email overdue triggers.
5. **Production Secrets, SSL/TLS & Disaster Recovery Backup**:
   - *Example*: Audit HashiCorp Vault environment secrets, verify SSL wildcard certificates, and generate an immutable, point-in-time encrypted snapshot to off-site AWS S3 cold storage with a proven 10-minute Recovery Time Objective (RTO).

---

### 🔄 Task 3: Rollback Plan (Users Cannot Log In After Deployment)
If users cannot authenticate immediately following deployment, the team activates the following immediate 4-phase incident rollback plan:
- **Phase 1: Detection & Incident Declaration (< 2 Minutes)**:
  - Synthetic probes detect an HTTP 503 spike (> 5%) on `/api/auth/login`. PagerDuty alerts the Lead SRE and SRE War Room is initiated.
- **Phase 2: Instant Route Failover (< 30 Seconds)**:
  - Reverse proxy router (Nginx / Cloud Load Balancer) atomically redirects 100% of incoming web traffic from **Green (v1.1.0)** back to **Blue (v1.0.0)**. Normal student login capabilities are immediately restored.
- **Phase 3: Database & State Alignment**:
  - Invalidate corrupted session tokens generated during the failure window in Redis; inspect database audit logs to ensure zero partial/inconsistent borrowing transactions occurred during the 2-minute transition.
- **Phase 4: Blameless Root Cause Analysis (RCA) & Quarantine**:
  - Green environment is quarantined for forensic analysis. A formal RCA is published within 24 hours identifying the token signing key mismatch or misconfigured OAuth redirect URI.

---

### 🛠️ Task 4: Software Maintenance (4 Concrete Library System Examples)
1. **Corrective Maintenance (Bug Fix)**:
   - *Example*: Resolving a concurrency race condition where two students click "Borrow" on the last remaining physical copy of *Designing Data-Intensive Applications* simultaneously, causing inventory count to drop to `-1`. Fixed by introducing row-level database mutex locks and optimistic concurrency transactions.
2. **Adaptive Maintenance (Environment / Policy Shift)**:
   - *Example*: Updating the authentication service to integrate with the University's new Azure Active Directory SAML 2.0 Single Sign-On (SSO) and upgrading the application runtime from Node.js 18 to Node.js 22 LTS to comply with campus IT security policies.
3. **Perfective Maintenance (Performance / UX Enhancement)**:
   - *Example*: Developing a trie-based search index with predictive auto-suggest and algorithmic book recommendations based on user academic department, slashing catalog query latency from 420ms down to 38ms.
4. **Preventive Maintenance (Proactive Reliability)**:
   - *Example*: Setting up an automated weekly database `VACUUM` and index defragmentation cron job, configuring automated 30-day log rotation with compression, and running weekly Dependabot/npm audit vulnerability sweeps to patch libraries before CVE exposure.

---

### 📊 Task 5: Monitoring Indicators & Project Closure
#### 3 Monitored System Performance Indicators:
1. **P95 API Response Time (Latency)**:
   - *Target*: `< 200 ms`. Gauges end-to-end response time for book queries, logins, and loan transactions.
2. **HTTP 5xx Error Rate**:
   - *Target*: `< 0.10%`. Triggers immediate incident escalation if borrowing or authentication endpoints fail.
3. **Server CPU & Memory Utilization (Resource Saturation)**:
   - *Target*: `< 70%`. Monitored via Node.js event-loop metrics and OS memory saturation to preempt node degradation.

#### 5 Activities for System Handover & Project Closure:
1. **Staff & Librarian Training Workshops**: Conduct recorded training sessions and provide operational reference guides for librarians on managing catalog stocks, due dates, and student records.
2. **Technical Documentation & OpenAPI Delivery**: Deliver complete architecture runbooks, database schema diagrams, OpenAPI/Swagger specifications, and disaster recovery procedures.
3. **Formal Stakeholder UAT Sign-Off**: Secure written acceptance agreements from the Chief Librarian and University IT Directorate verifying all requirements are met.
4. **Production Infrastructure & Secrets Handover**: Transfer Git repository administrator rights, HashiCorp Vault secrets, DNS control, and cloud hosting accounts to campus IT operations.
5. **Post-Implementation Review (PIR) & Final Project Archival**: Conduct a blameless project post-mortem, document lessons learned, record SLA baselines, and officially archive project tickets.

---

## 🖥️ Application Features & Interactive Views

### 1. 📚 Online Library Portal
- Real-time catalog search and category filtering.
- One-click book borrowing and return workflows with automatic stock updates and 14-day due date calculation.
- 1-Click Persona Switcher for instant testing across **Admin**, **Librarian**, and **Student** roles.

### 2. 🚀 Deployment & Operations Suite
- **Interactive Blue-Green Router**: Switch traffic dynamically between Blue and Green clusters.
- **Pre-Deployment Checklist Tracker**: Interactive state persistence of the 5 readiness gates.
- **Rollback Incident Simulator**: Click "Simulate Login Crash" to see degraded auth status (HTTP 503), then click "1-Click Rollback" to observe instantaneous automated traffic pointer switch to Blue with logged recovery time.
- **Live Telemetry Gauges**: Real-time polling of P95 latency, error rates, and CPU/memory saturation.
- **Maintenance Quadrant Explorer**: View all 4 maintenance types with concrete library system scenarios.

### 3. 📄 Strict 2-Page Document Submission View
- Built strictly to the **maximum 2-page** requirement.
- Formatted with `@page { size: A4; margin: 8mm; }` and page breaks.
- Includes a dedicated "🖨️ Print / Save as PDF (Strict 2 Pages)" button that outputs Page 1 (Tasks 1 & 2) and Page 2 (Tasks 3, 4, 5 & Sign-off) with zero overflow.

### 4. 🎙️ 5-Minute Group Presentation Mode
- Fullscreen slide deck containing 5 slides (1 slide per task and student).
- Real-time 5:00 countdown timer with play, pause, reset, and visual warning when under 60 seconds.
- Integrated speaker notes and keyboard arrow navigation (Space / Arrow keys).

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18, v20, or v22 LTS)

### Quick Start
1. Clone or navigate to the project directory:
   ```bash
   cd "e:\library software"
   ```
2. Start the Node.js server:
   ```bash
   npm start
   ```
3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

### Default Credentials
- **Admin**: `admin@library.edu` / `Admin@123`
- **Librarian**: `librarian@library.edu` / `Librarian@123`
- **Student**: `student@library.edu` / `Student@123`
*(Or use the 1-click demo switcher button on the top right or sign-in modal!)*
