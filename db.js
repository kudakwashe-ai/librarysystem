const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function readJSON(filename, defaultValue = []) {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultValue);
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJSON(filename, data) {
  const filePath = getFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Seed initial database
async function initDB() {
  const usersFile = 'users.json';
  const booksFile = 'books.json';
  const maintenanceFile = 'maintenance.json';
  const deploymentFile = 'deployment.json';
  const borrowsFile = 'borrows.json';

  let users = readJSON(usersFile, null);
  if (!users || users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    users = [
      {
        id: 'usr-1',
        name: 'Kudakwashe Donell Nyapadzauru',
        email: 'admin@library.edu',
        passwordHash: await bcrypt.hash('Admin@123', salt),
        role: 'Admin',
        studentId: '20240040312',
        department: 'Computer Science / Software Engineering',
        createdAt: new Date().toISOString()
      }
    ];
    writeJSON(usersFile, users);
    console.log('[DB] Initialized with Administrator account (Kudakwashe Donell Nyapadzauru - 20240040312)');
  }

  let books = readJSON(booksFile, null);
  if (!books || books.length === 0) {
    books = [
      {
        id: 'bk-101',
        title: 'Clean Architecture: A Craftsman\'s Guide',
        author: 'Robert C. Martin',
        isbn: '978-0134494166',
        category: 'Software Engineering',
        totalCopies: 6,
        availableCopies: 4,
        shelfLocation: 'Stack 4B - SE-01',
        publicationYear: 2018,
        description: 'Universal rules of software architecture and system deployment patterns.'
      },
      {
        id: 'bk-102',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        category: 'Distributed Systems',
        totalCopies: 5,
        availableCopies: 3,
        shelfLocation: 'Stack 2A - DS-14',
        publicationYear: 2017,
        description: 'The big ideas behind reliable, scalable, and maintainable systems.'
      },
      {
        id: 'bk-103',
        title: 'Continuous Delivery: Reliable Software Releases',
        author: 'Jez Humble, David Farley',
        isbn: '978-0321601919',
        category: 'DevOps & Deployment',
        totalCopies: 4,
        availableCopies: 2,
        shelfLocation: 'Stack 5C - DO-08',
        publicationYear: 2010,
        description: 'Blue-Green, Canary, and automated release pipeline strategies.'
      },
      {
        id: 'bk-104',
        title: 'Site Reliability Engineering (SRE)',
        author: 'Betsy Beyer, Chris Jones, et al.',
        isbn: '978-1491929124',
        category: 'Operations & Maintenance',
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'Stack 5C - OP-02',
        publicationYear: 2016,
        description: 'Google’s operational handbook on monitoring, SLOs, and incident rollback.'
      },
      {
        id: 'bk-105',
        title: 'Modern Software Engineering',
        author: 'David Farley',
        isbn: '978-0137314911',
        category: 'Software Engineering',
        totalCopies: 7,
        availableCopies: 5,
        shelfLocation: 'Stack 4B - SE-19',
        publicationYear: 2021,
        description: 'A disciplined approach to iterative development, testing, and deployment.'
      },
      {
        id: 'bk-106',
        title: 'Database System Concepts (7th Edition)',
        author: 'Silberschatz, Korth, Sudarshan',
        isbn: '978-0078022159',
        category: 'Databases',
        totalCopies: 8,
        availableCopies: 6,
        shelfLocation: 'Stack 1D - DB-05',
        publicationYear: 2019,
        description: 'Fundamentals of database transactions, ACID properties, and migrations.'
      }
    ];
    writeJSON(booksFile, books);
    console.log('[DB] Seeded library book catalog');
  }

  let borrows = readJSON(borrowsFile, null);
  if (!borrows) {
    borrows = [
      {
        id: 'bor-1',
        userId: 'usr-3',
        bookId: 'bk-101',
        bookTitle: 'Clean Architecture: A Craftsman\'s Guide',
        borrowerName: 'Jordan Taylor',
        borrowedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 11 * 86400000).toISOString(),
        returnedAt: null,
        status: 'Active'
      },
      {
        id: 'bor-2',
        userId: 'usr-3',
        bookId: 'bk-103',
        bookTitle: 'Continuous Delivery: Reliable Software Releases',
        borrowerName: 'Jordan Taylor',
        borrowedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 6 * 86400000).toISOString(),
        returnedAt: null,
        status: 'Active'
      }
    ];
    writeJSON(borrowsFile, borrows);
  }

  let maintenance = readJSON(maintenanceFile, null);
  if (!maintenance || maintenance.length === 0) {
    maintenance = [
      {
        id: 'maint-1',
        type: 'Corrective',
        title: 'Resolved Concurrent Checkout Race Condition',
        description: 'Fixed transactional race condition where simultaneous checkout requests for the last physical textbook copy resulted in negative book inventory.',
        severity: 'High',
        component: 'Inventory Service / Borrow API',
        resolvedDate: '2026-10-18',
        actionTaken: 'Implemented row-level mutex locking and optimistic concurrency checks in SQLite/PostgreSQL checkout transactions.',
        status: 'Resolved'
      },
      {
        id: 'maint-2',
        type: 'Adaptive',
        title: 'University Azure AD / SAML SSO Integration & Node 22 Upgrade',
        description: 'Adapted the authentication pipeline to support campus-wide Azure Active Directory SAML 2.0 and upgraded runtime from Node.js 18 to Node 22 LTS.',
        severity: 'Medium',
        component: 'Auth Service & Runtime Engine',
        resolvedDate: '2026-10-25',
        actionTaken: 'Integrated passport-saml token validation and updated package dependencies to comply with University IT ISO-27001 mandates.',
        status: 'Implemented'
      },
      {
        id: 'maint-3',
        type: 'Perfective',
        title: 'Sub-50ms Catalog Search Indexing & Predictive Auto-Suggest',
        description: 'Enhanced search UX by adding trie-based search indexing, fuzzy keyword caching, and algorithmic popular book recommendations based on user department.',
        severity: 'Low',
        component: 'Catalog Search Engine',
        resolvedDate: '2026-11-01',
        actionTaken: 'Reduced p95 search latency from 420ms to 38ms; student catalog engagement increased by 42%.',
        status: 'Deployed'
      },
      {
        id: 'maint-4',
        type: 'Preventive',
        title: 'Automated Log Rotation, DB VACUUM & Weekly Dependency CVE Scanning',
        description: 'Implemented automated nightly database VACUUM/re-indexing, 30-day log rotation with gzip compression, and automated npm audit GitHub actions.',
        severity: 'Medium',
        component: 'DevOps & Database Storage',
        resolvedDate: '2026-11-02',
        actionTaken: 'Prevents database fragmentation and eliminates risk of disk exhaustion or unpatched zero-day vulnerabilities in third-party libraries.',
        status: 'Active'
      }
    ];
    writeJSON(maintenanceFile, maintenance);
  }

  let deployment = readJSON(deploymentFile, null);
  if (!deployment || !deployment.activeEnvironment) {
    deployment = {
      strategy: 'Blue-Green',
      activeEnvironment: 'Blue', // 'Blue' or 'Green'
      trafficDistribution: {
        bluePercent: 100,
        greenPercent: 0
      },
      environments: {
        blue: {
          name: 'Blue (Production v1.0.0)',
          version: '1.0.0-prod',
          status: 'HEALTHY',
          uptime: '99.98%',
          deployedAt: '2026-10-15T08:00:00Z',
          instances: 4,
          p95Latency: '142ms',
          errorRate: '0.02%'
        },
        green: {
          name: 'Green (Staged v1.1.0)',
          version: '1.1.0-release',
          status: 'STANDBY',
          uptime: '100%',
          deployedAt: '2026-11-03T10:00:00Z',
          instances: 4,
          p95Latency: '118ms',
          errorRate: '0.00%'
        }
      },
      preDeploymentChecklist: [
        {
          id: 'chk-1',
          activity: 'Automated Database Migration & Integrity Dry-Run',
          status: 'COMPLETED',
          timestamp: '2026-11-03T09:15:00Z',
          details: 'Verified forward and backward migration scripts on sanitized production database replica with 120,000 book records.'
        },
        {
          id: 'chk-2',
          activity: 'Full Security Penetration & OWASP Top-10 Audit',
          status: 'COMPLETED',
          timestamp: '2026-11-03T09:30:00Z',
          details: 'Executed automated SAST/DAST scans; verified JWT token signing algorithm, rate limiting, and RBAC privilege separation.'
        },
        {
          id: 'chk-3',
          activity: 'Concurrency & Stress Load Testing (5,000 Students)',
          status: 'COMPLETED',
          timestamp: '2026-11-03T09:45:00Z',
          details: 'Simulated 5,000 simultaneous book checkout transactions using k6; p95 latency remained under 180ms with 0% dropped connections.'
        },
        {
          id: 'chk-4',
          activity: 'End-to-End User Acceptance Testing (UAT) Sign-Off',
          status: 'COMPLETED',
          timestamp: '2026-11-03T10:00:00Z',
          details: 'Formal acceptance testing approved by Head Librarian and Student Union representatives across all key library workflows.'
        },
        {
          id: 'chk-5',
          activity: 'Production Secrets, SSL/TLS & Automated Backup Snapshot',
          status: 'COMPLETED',
          timestamp: '2026-11-03T10:15:00Z',
          details: 'Encrypted backup snapshot stored in off-site S3 cold storage; rotated production JWT keys; verified TLS 1.3 cert expiration in 2027.'
        }
      ],
      rollbackHistory: []
    };
    writeJSON(deploymentFile, deployment);
  }
}

module.exports = {
  readJSON,
  writeJSON,
  initDB
};
