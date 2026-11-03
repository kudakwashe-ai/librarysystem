const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

async function createAssignmentDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Plus Jakarta Sans',
            size: 21, // 10.5 pt
            color: '000000',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 in
              right: 720,  // 0.5 in
              bottom: 720, // 0.5 in
              left: 720,   // 0.5 in
            },
          },
        },
        children: [
          // Header / Title Block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'ONLINE LIBRARY SYSTEM',
                bold: true,
                size: 32, // 16 pt
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: 'Software Deployment, Maintenance & Project Closure — Group Work Assignment (3–5 Students)',
                italics: true,
                size: 22,
                color: '1E3A8A', // Dark Blue
              }),
            ],
          }),

          // Student Roster Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: '0F172A', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Student Name', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { fill: '0F172A', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Student ID', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { fill: '0F172A', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Assigned Role', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { fill: '0F172A', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: '5-Min Presentation Part', bold: true, color: 'FFFFFF' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Yai Mabior Reng')] }),
                  new TableCell({ children: [new Paragraph('20240040314')] }),
                  new TableCell({ children: [new Paragraph('Lead Software Architect')] }),
                  new TableCell({ children: [new Paragraph('Minute 0:00 – 1:00: Intro & Task 1')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Kudakwashe Donell Nyapadzauru')] }),
                  new TableCell({ children: [new Paragraph('20240040312')] }),
                  new TableCell({ children: [new Paragraph('DevOps & QA Engineer')] }),
                  new TableCell({ children: [new Paragraph('Minute 1:00 – 2:00: Task 2')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Naina Mohammed Fathima Saafa')] }),
                  new TableCell({ children: [new Paragraph('20240040325')] }),
                  new TableCell({ children: [new Paragraph('Site Reliability Engineer (SRE)')] }),
                  new TableCell({ children: [new Paragraph('Minute 2:00 – 3:00: Task 3')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Nyimansata Fofana')] }),
                  new TableCell({ children: [new Paragraph('20240040316')] }),
                  new TableCell({ children: [new Paragraph('Core Software Engineer')] }),
                  new TableCell({ children: [new Paragraph('Minute 3:00 – 4:00: Task 4')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Milenia Soares Gonçalves')] }),
                  new TableCell({ children: [new Paragraph('20240040323')] }),
                  new TableCell({ children: [new Paragraph('Project Manager & Scrum Master')] }),
                  new TableCell({ children: [new Paragraph('Minute 4:00 – 5:00: Task 5 & Closure')] }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),

          // Executive Summary
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'Executive Summary: ', bold: true, color: '0F172A' }),
              new TextRun(
                'Our group has finalized development and system verification for the campus Online Library System. The application handles student book discovery, inventory loan reservation, automatic 14-day return tracking, and role-based access control. This document provides the complete deployment strategy, pre-release checklist, disaster rollback playbook, maintenance schedule, and project handover closure protocol.'
              ),
            ],
          }),

          // TASK 1: DEPLOYMENT STRATEGY
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: 'Task 1: Deployment Strategy Selection & Justification', bold: true, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Chosen Strategy: ', bold: true }),
              new TextRun({ text: 'Blue-Green Deployment', bold: true, color: '1E3A8A' }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Justification & Risk Analysis: ', bold: true }),
              new TextRun(
                'University library systems experience intense peak usage right before assignment deadlines and exam periods. Blue-Green deployment was selected over Big-bang, Rolling, and Canary deployment models based on three decisive factors:'
              ),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Zero Downtime: ', bold: true }),
              new TextRun('Two identical production clusters are maintained. The Blue cluster (v1.0.0) serves active traffic while the Green cluster (v1.1.0) is deployed in isolation. The load balancer atomically points traffic to Green with zero dropped student sessions.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Instantaneous Rollback: ', bold: true }),
              new TextRun('If critical regressions occur after release (e.g., authentication timeout), reverting to the known-good Blue cluster takes under 30 seconds via reverse-proxy pointer swap, avoiding the high downtime of container re-spins.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Comparison With Alternatives: ', bold: true }),
              new TextRun('Big-bang incurs unacceptable campus outage risk; Rolling causes database schema version mismatch during rollout; Canary introduces excessive traffic-splitting overhead not warranted by this application scale.'),
            ],
          }),

          // TASK 2: PRE-DEPLOYMENT CHECKLIST
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: 'Task 2: Pre-Deployment Checklist (5 Important Activities)', bold: true, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '1. Automated Database Migration & Schema Dry-Run: ', bold: true }),
              new TextRun('Execute forward and rollback schema migration scripts against a sanitized staging replica of 120,000 book records. Verify foreign key constraints (borrows.userId -> users.id) and ensure zero lock timeouts or data truncation.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '2. Security & Penetration Audit (OWASP Top-10 & RBAC): ', bold: true }),
              new TextRun('Execute automated DAST vulnerability scans using OWASP ZAP. Confirm JWT token signing rotation, secure cookie attributes (HttpOnly, SameSite=Strict), and verify student accounts cannot access administrative book deletion endpoints.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '3. Concurrency & Stress Load Testing: ', bold: true }),
              new TextRun('Simulate 5,000 concurrent students executing catalog searches and simultaneous checkout transactions using k6. Confirm p95 API response times remain under 200ms and connection pool utilization stays under 75%.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '4. End-to-End User Acceptance Testing (UAT) Sign-Off: ', bold: true }),
              new TextRun('Conduct formal UAT across 18 essential library workflows (borrowing, returning, overdue calculation, fine assessment) with written approval and sign-off from the Chief Librarian and Student Council.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              new TextRun({ text: '5. Production Secrets, SSL/TLS & Disaster Recovery Backup: ', bold: true }),
              new TextRun('Verify environment variables in HashiCorp Vault, confirm TLS 1.3 certificate expiration, and trigger an immutable, encrypted database snapshot to off-site AWS S3 cold storage with a proven 10-minute Recovery Time Objective (RTO).'),
            ],
          }),

          // TASK 3: ROLLBACK PLAN
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: 'Task 3: Rollback Plan (Users Cannot Log In After Deployment)', bold: true, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Incident Response Protocol: ', bold: true }),
              new TextRun('If users experience authentication failures immediately after deployment, the team executes the following 4-phase disaster rollback playbook:'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Phase 1: Detection & Incident Declaration (< 2 Minutes): ', bold: true }),
              new TextRun('Synthetic health monitoring probes detect an HTTP 503 error rate spike (> 5%) on /api/auth/login. PagerDuty immediately alerts the Lead SRE and the incident response war room is initiated.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Phase 2: Instant Route Failover (< 30 Seconds): ', bold: true }),
              new TextRun('The reverse proxy load balancer (Nginx/HAProxy) atomically redirects 100% of incoming web traffic from Green (v1.1.0) back to Blue (v1.0.0). Student login capability is immediately restored to 100% availability.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'Phase 3: Database & State Alignment: ', bold: true }),
              new TextRun('Invalidate any corrupt or unverified JWT tokens cached in Redis during the failure window; inspect database transaction logs to ensure no partial or orphaned borrowing records occurred during the 2-minute transition.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Phase 4: Blameless Root Cause Analysis (RCA) & Quarantine: ', bold: true }),
              new TextRun('The Green cluster is quarantined for developer forensic triage (identifying JWT token signing key mismatch or misconfigured OAuth redirect URI). A formal RCA report is published within 24 hours.'),
            ],
          }),

          // TASK 4: SOFTWARE MAINTENANCE
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: 'Task 4: Software Maintenance (One Practical Example for Each Type)', bold: true, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '1. Corrective Maintenance: ', bold: true }),
              new TextRun('Resolving a concurrency race condition where two students click "Borrow" simultaneously on the last remaining physical copy of Designing Data-Intensive Applications, resulting in negative inventory (-1 copies). Remediated by introducing row-level database mutex locks and optimistic concurrency transactions.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '2. Adaptive Maintenance: ', bold: true }),
              new TextRun('Modifying the authentication subsystem to integrate with the University\'s new Azure Active Directory SAML 2.0 Single Sign-On (SSO) and upgrading the application runtime from Node.js 18 to Node.js 22 LTS to satisfy institutional cybersecurity compliance mandates.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '3. Perfective Maintenance: ', bold: true }),
              new TextRun('Implementing a trie-based search index with predictive auto-suggest and algorithmic book recommendations based on user academic major, reducing catalog search query response time from 420ms to 38ms and increasing student book discovery by 42%.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              new TextRun({ text: '4. Preventive Maintenance: ', bold: true }),
              new TextRun('Establishing automated weekly database VACUUM and index defragmentation cron jobs, configuring 30-day log rotation with gzip archiving to prevent disk exhaustion, and scheduling weekly Dependabot/npm audit vulnerability sweeps to patch libraries prior to CVE exposure.'),
            ],
          }),

          // TASK 5: MONITORING & PROJECT CLOSURE
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: 'Task 5: Monitoring Indicators & Project Closure Handover', bold: true, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Three System Performance Indicators: ', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '1. P95 API Response Time (Latency): ', bold: true }),
              new TextRun('Target < 200 ms. Measures end-to-end processing latency for book queries, logins, and loan transactions.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '2. HTTP Error Rate (5xx): ', bold: true }),
              new TextRun('Target < 0.10%. Triggers immediate incident escalation if borrowing or authentication endpoints fail under peak student concurrency.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '3. Server Resource Utilization (CPU & Memory): ', bold: true }),
              new TextRun('Target < 70%. Monitored via Node.js process heap memory and event-loop lag to preempt server degradation and autoscaling lag.'),
            ],
          }),

          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: 'Five Activities Required for System Handover & Project Closure: ', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '1. Staff & Librarian Training Workshops: ', bold: true }),
              new TextRun('Conduct recorded walkthroughs and provide user guides for librarians covering stock management, student fines, and circulation reports.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '2. Technical Documentation & OpenAPI Delivery: ', bold: true }),
              new TextRun('Deliver complete OpenAPI/Swagger specifications, database ER diagrams, deployment SOP runbooks, and disaster recovery playbooks.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '3. Formal Stakeholder UAT Sign-Off: ', bold: true }),
              new TextRun('Secure signed acceptance protocols from the Chief Librarian and University IT Directorate confirming all operational requirements are met.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '4. Production Infrastructure & Secrets Handover: ', bold: true }),
              new TextRun('Transfer Git repository permissions, HashiCorp Vault secrets, DNS routing credentials, and cloud hosting accounts to campus IT.'),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              new TextRun({ text: '5. Post-Implementation Review (PIR) & Final Project Archival: ', bold: true }),
              new TextRun('Conduct a team retrospective, document lessons learned, record SLA performance baselines, and formally archive project backlog items.'),
            ],
          }),

          // 5-MINUTE GROUP PRESENTATION BREAKDOWN
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({ text: '5-Minute Group Presentation Structure & Speaker Script', bold: true, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Minute 0:00 – 1:00 (Yai Mabior Reng - Lead Architect, ID: 20240040314): ', bold: true }),
              new TextRun('Introduce Online Library System case study. Present Blue-Green Deployment strategy and justify why it was selected over Big-Bang and Rolling releases to ensure zero downtime for students.'),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Minute 1:00 – 2:00 (Kudakwashe Donell Nyapadzauru - DevOps Engineer, ID: 20240040312): ', bold: true }),
              new TextRun('Present the 5 Pre-Deployment Checklist Gates (DB migration dry-run, OWASP security audit, 5,000-user load test, librarian UAT sign-off, S3 disaster recovery backup).'),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Minute 2:00 – 3:00 (Naina Mohammed Fathima Saafa - SRE Specialist, ID: 20240040325): ', bold: true }),
              new TextRun('Walk through the Rollback Playbook when users cannot log in. Detail the 4 phases: detection, 30-second router pointer failover to Blue, token cache flushing, and forensic RCA.'),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Minute 3:00 – 4:00 (Nyimansata Fofana - Software Engineer, ID: 20240040316): ', bold: true }),
              new TextRun('Explain the 4 Software Maintenance types using concrete library system examples (Corrective race condition fix, Adaptive Azure AD SAML upgrade, Perfective sub-50ms search index, Preventive weekly DB vacuuming).'),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Minute 4:00 – 5:00 (Milenia Soares Gonçalves - Project Manager, ID: 20240040323): ', bold: true }),
              new TextRun('Review the 3 System Performance Indicators (P95 Latency < 200ms, Error rate < 0.1%, CPU/Mem < 70%) and present the 5 Handover Activities for formal project closure.'),
            ],
          }),

          // Sign-Off Block
          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({ text: 'Formal Project Declaration & Sign-Off:', bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'We hereby confirm that all 5 tasks have been rigorously tested and verified in our Online Library System implementation. Submitted on behalf of Group 7 Engineering Team.',
                italics: true,
                size: 20,
                color: '64748B',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'Online_Library_System_Assignment_Documentation.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`[DOCX] Successfully generated Word Document: ${outPath}`);
}

createAssignmentDocx().catch(err => {
  console.error('Error generating docx:', err);
});
