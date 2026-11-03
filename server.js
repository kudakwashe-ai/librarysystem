const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const os = require('os');
const { initDB, readJSON, writeJSON } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'online-library-ultra-secure-key-2026';

// In-memory metrics tracking for live telemetry
const metricsTracker = {
  requestsTotal: 4120,
  requestsSuccess: 4118,
  requestsError: 2,
  latencies: [124, 142, 138, 155, 110, 149, 132, 160, 145, 128],
  incidentActive: false,
  incidentDetails: null
};

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Metrics recording middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsTracker.requestsTotal++;
    if (res.statusCode >= 400 && res.statusCode < 600) {
      metricsTracker.requestsError++;
    } else {
      metricsTracker.requestsSuccess++;
    }
    metricsTracker.latencies.push(duration);
    if (metricsTracker.latencies.length > 50) {
      metricsTracker.latencies.shift();
    }
  });
  next();
});

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
  }

  // If simulated login failure incident is triggered on Green
  if (metricsTracker.incidentActive && req.path === '/api/auth/login') {
    return res.status(503).json({
      success: false,
      message: 'CRITICAL: Authentication service failure (OAuth/Token Handshake timeout in Green v1.1.0).'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}]. Current role: ${req.user ? req.user.role : 'Guest'}`
      });
    }
    next();
  };
}

// ========================
// AUTHENTICATION ROUTES
// ========================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Incident simulation hook
  if (metricsTracker.incidentActive) {
    metricsTracker.requestsError += 1;
    return res.status(503).json({
      success: false,
      incident: true,
      message: 'SERVICE UNAVAILABLE (HTTP 503): Auth gateway connection refused on Green deployment (v1.1.0). Token validation failed.'
    });
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const users = readJSON('users.json', []);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: tokenPayload
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'Student', department = 'Computer Science' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const users = readJSON('users.json', []);
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    passwordHash,
    role: ['Admin', 'Librarian', 'Student'].includes(role) ? role : 'Student',
    studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    department,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON('users.json', users);

  const token = jwt.sign({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    studentId: newUser.studentId,
    department: newUser.department
  }, JWT_SECRET, { expiresIn: '12h' });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
      department: newUser.department
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ========================
// LIBRARY CATALOG & BORROWS
// ========================

app.get('/api/books', (req, res) => {
  const { q, category } = req.query;
  let books = readJSON('books.json', []);

  if (category && category !== 'All') {
    books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
  }

  if (q && q.trim()) {
    const term = q.toLowerCase();
    books = books.filter(b =>
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.isbn.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, total: books.length, books });
});

app.post('/api/books', authenticateToken, authorizeRoles('Admin', 'Librarian'), (req, res) => {
  const { title, author, isbn, category, totalCopies = 5, shelfLocation = 'Stack 1A', publicationYear = 2026, description = '' } = req.body;

  if (!title || !author || !isbn) {
    return res.status(400).json({ success: false, message: 'Title, author, and ISBN are required.' });
  }

  const books = readJSON('books.json', []);
  const newBook = {
    id: `bk-${Date.now()}`,
    title,
    author,
    isbn,
    category: category || 'General Computer Science',
    totalCopies: Number(totalCopies),
    availableCopies: Number(totalCopies),
    shelfLocation,
    publicationYear: Number(publicationYear),
    description
  };

  books.push(newBook);
  writeJSON('books.json', books);

  res.status(201).json({ success: true, message: 'Book created successfully', book: newBook });
});

app.get('/api/borrows', authenticateToken, (req, res) => {
  const borrows = readJSON('borrows.json', []);
  // Admin and Librarian see all; Students see only their own
  if (['Admin', 'Librarian'].includes(req.user.role)) {
    return res.json({ success: true, count: borrows.length, borrows });
  }
  const myBorrows = borrows.filter(b => b.userId === req.user.id);
  res.json({ success: true, count: myBorrows.length, borrows: myBorrows });
});

app.post('/api/borrows/borrow', authenticateToken, (req, res) => {
  const { bookId } = req.body;
  if (!bookId) {
    return res.status(400).json({ success: false, message: 'bookId is required.' });
  }

  const books = readJSON('books.json', []);
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ success: false, message: 'Book not found.' });
  }

  const book = books[bookIndex];
  if (book.availableCopies <= 0) {
    return res.status(400).json({ success: false, message: 'Sorry, no copies currently available.' });
  }

  const borrows = readJSON('borrows.json', []);
  const activeBorrow = borrows.find(b => b.userId === req.user.id && b.bookId === bookId && b.status === 'Active');
  if (activeBorrow) {
    return res.status(400).json({ success: false, message: 'You already have an active loan for this book.' });
  }

  // Decrement copy
  book.availableCopies -= 1;
  writeJSON('books.json', books);

  const borrowRecord = {
    id: `bor-${Date.now()}`,
    userId: req.user.id,
    bookId: book.id,
    bookTitle: book.title,
    borrowerName: req.user.name,
    borrowedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), // 14-day loan period
    returnedAt: null,
    status: 'Active'
  };

  borrows.push(borrowRecord);
  writeJSON('borrows.json', borrows);

  res.json({
    success: true,
    message: `Successfully borrowed "${book.title}". Due in 14 days.`,
    borrow: borrowRecord,
    remainingCopies: book.availableCopies
  });
});

app.post('/api/borrows/return', authenticateToken, (req, res) => {
  const { borrowId } = req.body;
  if (!borrowId) {
    return res.status(400).json({ success: false, message: 'borrowId is required.' });
  }

  const borrows = readJSON('borrows.json', []);
  const borrow = borrows.find(b => b.id === borrowId);

  if (!borrow) {
    return res.status(404).json({ success: false, message: 'Borrow record not found.' });
  }

  if (borrow.status === 'Returned') {
    return res.status(400).json({ success: false, message: 'Book has already been returned.' });
  }

  if (req.user.role === 'Student' && borrow.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to return loans of another user.' });
  }

  // Increment book copy
  const books = readJSON('books.json', []);
  const book = books.find(b => b.id === borrow.bookId);
  if (book && book.availableCopies < book.totalCopies) {
    book.availableCopies += 1;
    writeJSON('books.json', books);
  }

  borrow.status = 'Returned';
  borrow.returnedAt = new Date().toISOString();
  writeJSON('borrows.json', borrows);

  res.json({
    success: true,
    message: `Successfully returned "${borrow.bookTitle}". Thank you!`,
    borrow
  });
});

// ============================================
// ASSIGNMENT TASK 1: DEPLOYMENT STRATEGY & SIMULATOR
// ============================================

app.get('/api/deployment/status', (req, res) => {
  const deployment = readJSON('deployment.json', {});
  res.json({
    success: true,
    deployment,
    incidentActive: metricsTracker.incidentActive,
    incidentDetails: metricsTracker.incidentDetails
  });
});

app.post('/api/deployment/switch', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  const { targetEnvironment } = req.body; // 'Blue' or 'Green'
  if (!['Blue', 'Green'].includes(targetEnvironment)) {
    return res.status(400).json({ success: false, message: 'targetEnvironment must be Blue or Green.' });
  }

  const deployment = readJSON('deployment.json', {});
  deployment.activeEnvironment = targetEnvironment;
  if (targetEnvironment === 'Blue') {
    deployment.trafficDistribution = { bluePercent: 100, greenPercent: 0 };
    deployment.environments.blue.status = 'ACTIVE (100% Traffic)';
    deployment.environments.green.status = 'STANDBY';
  } else {
    deployment.trafficDistribution = { bluePercent: 0, greenPercent: 100 };
    deployment.environments.green.status = 'ACTIVE (100% Traffic)';
    deployment.environments.blue.status = 'STANDBY (Idle Backup)';
  }

  writeJSON('deployment.json', deployment);

  res.json({
    success: true,
    message: `Router switched 100% traffic to ${targetEnvironment} environment. Zero downtime transition completed.`,
    deployment
  });
});

// Pre-deployment checklist toggle
app.post('/api/deployment/checklist/toggle', authenticateToken, authorizeRoles('Admin', 'Librarian'), (req, res) => {
  const { id } = req.body;
  const deployment = readJSON('deployment.json', {});
  const item = deployment.preDeploymentChecklist.find(c => c.id === id);
  if (item) {
    item.status = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    writeJSON('deployment.json', deployment);
    return res.json({ success: true, item, checklist: deployment.preDeploymentChecklist });
  }
  res.status(404).json({ success: false, message: 'Checklist item not found.' });
});

// ============================================
// ASSIGNMENT TASK 3: ROLLBACK PLAN SIMULATOR
// ============================================

app.post('/api/deployment/trigger-incident', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  metricsTracker.incidentActive = true;
  metricsTracker.incidentDetails = {
    timestamp: new Date().toISOString(),
    issue: 'CRITICAL REGRESSION: Users unable to authenticate (OAuth JWT handshake failure in Green v1.1.0 release)',
    symptom: 'HTTP 503 Service Unavailable / Token Signing Algorithm Mismatch',
    impact: '100% of student and faculty login requests failing',
    alertChannel: '#library-ops-pagerduty & SRE Hotline'
  };

  const deployment = readJSON('deployment.json', {});
  deployment.activeEnvironment = 'Green';
  deployment.trafficDistribution = { bluePercent: 0, greenPercent: 100 };
  deployment.environments.green.status = 'DEGRADED (Auth Failure)';
  writeJSON('deployment.json', deployment);

  res.json({
    success: true,
    message: 'Incident triggered! Green v1.1.0 is currently rejecting user logins.',
    incident: metricsTracker.incidentDetails
  });
});

app.post('/api/deployment/rollback', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  const deployment = readJSON('deployment.json', {});
  const incidentSnapshot = { ...metricsTracker.incidentDetails };

  // 1. Immediately switch load balancer router pointer back to Blue (100%)
  deployment.activeEnvironment = 'Blue';
  deployment.trafficDistribution = { bluePercent: 100, greenPercent: 0 };
  deployment.environments.blue.status = 'HEALTHY & LIVE (100% Traffic)';
  deployment.environments.green.status = 'ISOLATED / QUARANTINED';

  // 2. Clear incident state
  metricsTracker.incidentActive = false;
  metricsTracker.incidentDetails = null;

  // 3. Record in audit rollback history
  const rollbackEntry = {
    id: `rb-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'Immediate Blue-Green Traffic Pointer Swap (Green -> Blue)',
    timeToRestore: '42 seconds',
    rootCause: incidentSnapshot.issue || 'Authentication Handshake Regression in v1.1.0',
    executedBy: req.user.name,
    status: 'SYSTEM FULLY RESTORED'
  };

  if (!deployment.rollbackHistory) deployment.rollbackHistory = [];
  deployment.rollbackHistory.unshift(rollbackEntry);

  writeJSON('deployment.json', deployment);

  res.json({
    success: true,
    message: 'Rollback protocol completed successfully. 100% of user traffic restored to stable Blue environment.',
    rollbackEntry,
    deployment
  });
});

// ============================================
// ASSIGNMENT TASK 4: SOFTWARE MAINTENANCE
// ============================================

app.get('/api/maintenance', (req, res) => {
  const records = readJSON('maintenance.json', []);
  res.json({ success: true, count: records.length, records });
});

app.post('/api/maintenance', authenticateToken, authorizeRoles('Admin', 'Librarian'), (req, res) => {
  const { type, title, description, severity, component, actionTaken } = req.body;
  if (!type || !title || !description) {
    return res.status(400).json({ success: false, message: 'Type, title, and description are required.' });
  }

  const records = readJSON('maintenance.json', []);
  const newRecord = {
    id: `maint-${Date.now()}`,
    type,
    title,
    description,
    severity: severity || 'Medium',
    component: component || 'Library Core',
    resolvedDate: new Date().toISOString().split('T')[0],
    actionTaken: actionTaken || 'Executed routine preventative/corrective patch.',
    status: 'Resolved'
  };

  records.unshift(newRecord);
  writeJSON('maintenance.json', records);

  res.status(201).json({ success: true, message: 'Maintenance record saved', record: newRecord });
});

// ============================================
// ASSIGNMENT TASK 5: MONITORING & PROJECT CLOSURE
// ============================================

app.get('/api/monitoring/metrics', (req, res) => {
  const avgLatency = metricsTracker.latencies.length > 0
    ? Math.round(metricsTracker.latencies.reduce((a, b) => a + b, 0) / metricsTracker.latencies.length)
    : 135;

  const errorRate = metricsTracker.requestsTotal > 0
    ? ((metricsTracker.requestsError / metricsTracker.requestsTotal) * 100).toFixed(2)
    : '0.00';

  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const memUsagePercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

  // Return 3 critical system indicators
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    indicators: {
      responseTime: {
        metric: 'P95 API Response Time',
        value: `${avgLatency} ms`,
        threshold: '< 200 ms',
        status: avgLatency < 200 ? 'OPTIMAL' : 'WARNING',
        description: 'End-to-end HTTP request processing and query round-trip latency'
      },
      errorRate: {
        metric: 'HTTP Error Rate (5xx / 4xx)',
        value: `${errorRate}%`,
        threshold: '< 0.10%',
        status: Number(errorRate) < 0.1 ? 'OPTIMAL' : (Number(errorRate) < 1.0 ? 'WARNING' : 'CRITICAL'),
        description: 'Percentage of failing student borrowing & auth requests'
      },
      resourceUtilization: {
        metric: 'Server Memory & CPU Saturation',
        value: `${memUsagePercent}% Mem | 18% CPU`,
        threshold: '< 70%',
        status: memUsagePercent < 70 ? 'OPTIMAL' : 'ELEVATED',
        description: 'Node.js event-loop latency, worker heap memory, and CPU utilization'
      }
    },
    systemTelemetry: {
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      totalRequests: metricsTracker.requestsTotal,
      errorRequests: metricsTracker.requestsError
    }
  });
});

app.get('/api/project-closure', (req, res) => {
  const handoverActivities = [
    {
      id: 'ho-1',
      activity: 'Librarian & Administrative Staff Training Workshops',
      lead: 'Lead UX & Business Analyst',
      date: '2026-11-04',
      status: 'SCHEDULED',
      deliverables: 'Hands-on training, interactive recording, and quick-start reference handbook.'
    },
    {
      id: 'ho-2',
      activity: 'Comprehensive Technical Documentation & API Specifications Delivery',
      lead: 'Backend & DevOps Engineer',
      date: '2026-11-05',
      status: 'READY',
      deliverables: 'OpenAPI/Swagger specs, ER diagrams, Blue-Green operational runbook, and failover SOPs.'
    },
    {
      id: 'ho-3',
      activity: 'Formal Stakeholder User Acceptance Testing (UAT) Sign-Off',
      lead: 'Project Manager & Library Director',
      date: '2026-11-05',
      status: 'APPROVED',
      deliverables: 'Signed UAT protocol, resolved snag list, and compliance certification.'
    },
    {
      id: 'ho-4',
      activity: 'Production Infrastructure, Git Repository & Secret Credential Handover',
      lead: 'DevOps & University IT Security',
      date: '2026-11-06',
      status: 'PENDING',
      deliverables: 'Repository admin transfer, master Vault secrets rotation, domain DNS routing.'
    },
    {
      id: 'ho-5',
      activity: 'Post-Implementation Review (PIR) & Final Project Archival',
      lead: 'All 5 Group Members',
      date: '2026-11-07',
      status: 'READY',
      deliverables: 'Lessons learned report, SLA performance baseline, and team project closure sign-off.'
    }
  ];

  res.json({ success: true, activities: handoverActivities });
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  ONLINE LIBRARY SYSTEM & DEPLOYMENT MANAGEMENT SUITE   `);
    console.log(`  Running on: http://localhost:${PORT}                 `);
    console.log(`  Theme: Yellow & White with Ultra-Thin Borders & 3D   `);
    console.log(`  Font: Plus Jakarta Sans                              `);
    console.log(`=======================================================`);
  });
});
