const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

console.log('Re-initializing Database with GUARANTEED data...');

// 1. Schema
db.exec('PRAGMA foreign_keys = OFF;'); // Disable checks for drops
db.exec(`
  DROP TABLE IF EXISTS tickets;
  DROP TABLE IF EXISTS alternatives;
  DROP TABLE IF EXISTS services;
`);
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    category TEXT,
    criticality_score INTEGER,
    user_count_estimate INTEGER
  );

  CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT,
    title TEXT,
    description TEXT,
    service_id INTEGER,
    status TEXT,
    priority TEXT,
    impact_score INTEGER,
    created_at DATETIME,
    resolved_at DATETIME,
    root_cause TEXT,
    root_cause_category TEXT,
    FOREIGN KEY(service_id) REFERENCES services(id)
  );

  CREATE TABLE alternatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    issue_type TEXT,
    description TEXT,
    FOREIGN KEY(service_id) REFERENCES services(id)
  );
`);

// 2. Guaranteed Seed Data
const SERVICES = [
    { name: 'Corporate Email (Exchange)', category: 'Communication', crit: 5, users: 4500 },
    { name: 'VPN Gateway - US East', category: 'Network', crit: 4, users: 1200 },
    { name: 'Payroll System (SAP)', category: 'Finance', crit: 5, users: 400 },
    { name: 'Customer Support Portal', category: 'External', crit: 4, users: 8000 },
    { name: 'Office WiFi (HQ)', category: 'Network', crit: 3, users: 600 },
    { name: 'JIRA Issue Tracker', category: 'DevOps', crit: 3, users: 300 },
    { name: 'Slack Messaging', category: 'Communication', crit: 2, users: 4500 }
];

const insertService = db.prepare('INSERT INTO services (name, category, criticality_score, user_count_estimate) VALUES (?, ?, ?, ?)');
const serviceIds = {};

SERVICES.forEach(s => {
    const info = insertService.run(s.name, s.category, s.crit, s.users);
    serviceIds[s.name] = info.lastInsertRowid;
});

// 3. Alternatives
const insertAlt = db.prepare('INSERT INTO alternatives (service_id, issue_type, description) VALUES (?, ?, ?)');
insertAlt.run(serviceIds['Corporate Email (Exchange)'], 'Server', 'Use Outlook Web Access (OWA) via the backup URL.');
insertAlt.run(serviceIds['VPN Gateway - US East'], 'Network', 'Connect to VPN Gateway - US West.');
insertAlt.run(serviceIds['Payroll System (SAP)'], 'Database', 'Manual timesheet entry forms are available on the Intranet.');
insertAlt.run(serviceIds['Office WiFi (HQ)'], 'Network', 'Use the "Guest" network or hardline ethernet if available.');

// 4. Tickets (Historical & Active)
const insertTicket = db.prepare(`
    INSERT INTO tickets (incident_id, title, description, service_id, status, priority, impact_score, created_at, resolved_at, root_cause, root_cause_category) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Helper to create dates
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

// ACTIVE INCIDENTS (The "Live Tracking" part)
insertTicket.run(
    'INC-2025-001',
    'Outlook Disconnected for Remote Users',
    'Users reporting inability to send/receive emails when connected via VPN. Exchange server responding slowly.',
    serviceIds['Corporate Email (Exchange)'],
    'In Progress',
    'Critical',
    95,
    hoursAgo(2),
    null,
    null,
    null
);

insertTicket.run(
    'INC-2025-002',
    'VPN Auth Timeout',
    'Authentication server is timing out for the US East gateway. 500 error returned.',
    serviceIds['VPN Gateway - US East'],
    'Diagnosing',
    'High',
    80,
    hoursAgo(0.5),
    null,
    null,
    null
);

insertTicket.run(
    'INC-2025-003',
    'WiFi Intermittent in Main Lobby',
    'Signal dropping in and out. AP reboot required.',
    serviceIds['Office WiFi (HQ)'],
    'Open',
    'Medium',
    40,
    hoursAgo(4),
    null,
    null,
    null
);

// RESOLVED INCIDENTS (For Stats)
for (let i = 0; i < 50; i++) {
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const sid = serviceIds[service.name];
    const created = hoursAgo(24 + (Math.random() * 100)); // 1-5 days ago
    const duration = 1 + Math.random() * 5; // 1-6 hours to resolve
    const resolved = new Date(new Date(created).getTime() + duration * 60 * 60 * 1000).toISOString();

    insertTicket.run(
        `INC-HIST-${1000 + i}`,
        `Legacy Issue: ${service.name} latency`,
        'Historical ticket for data population.',
        sid,
        'Resolved',
        Math.random() > 0.8 ? 'High' : 'Low',
        Math.floor(Math.random() * 50),
        created,
        resolved,
        'High CPU Load',
        'Server'
    );
}

console.log('Database populated successfully with guaranteed data.');
