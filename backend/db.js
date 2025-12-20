const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');

// Delete DB on startup to force re-seed (Cloud Ephemeral Strategy)
// In a real prod app we wouldn't do this, but for this demo to work nicely on Railway's file system,
// we want to ensure the latest seed data is always loaded on deploy.
try {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(dbPath)) {
    console.log('Production startup: wiping local SQLite to ensure fresh seed data...');
    fs.unlinkSync(dbPath);
  }
} catch (e) { console.error('Error resetting DB:', e); }

const db = new Database(dbPath);

function initDB() {
  console.log('Initializing Database Schema...');

  // Enable Foreign Keys
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        category TEXT,
        criticality_score INTEGER,
        user_count_estimate INTEGER
      );

      CREATE TABLE IF NOT EXISTS tickets (
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
        eta_override TEXT,
        FOREIGN KEY(service_id) REFERENCES services(id)
      );

      CREATE TABLE IF NOT EXISTS alternatives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        issue_type TEXT,
        description TEXT,
        FOREIGN KEY(service_id) REFERENCES services(id)
      );
    `);

  // Check if we need to seed (if services empty)
  const count = db.prepare('SELECT COUNT(*) as c FROM services').get().c;
  if (count > 0) {
    console.log('Database already populated. Skipping seed.');
    return db;
  }

  // --- SEED DATA ---
  console.log('Seeding Data with GUARANTEED Dataset...');

  // 1. Services (Expanded List)
  const SERVICES = [
    { name: 'Corporate Email (Exchange)', category: 'Communication', crit: 5, users: 4500 },
    { name: 'VPN Gateway - US East', category: 'Network', crit: 4, users: 1200 },
    { name: 'VPN Gateway - EU West', category: 'Network', crit: 4, users: 800 },
    { name: 'Payroll System (SAP)', category: 'Finance', crit: 5, users: 400 },
    { name: 'Customer Support Portal', category: 'External', crit: 4, users: 8000 },
    { name: 'Office WiFi (HQ)', category: 'Network', crit: 3, users: 600 },
    { name: 'JIRA Issue Tracker', category: 'DevOps', crit: 3, users: 300 },
    { name: 'GitHub Enterprise', category: 'DevOps', crit: 4, users: 150 },
    { name: 'Slack Messaging', category: 'Communication', crit: 2, users: 4500 },
    { name: 'HR Portal (Workday)', category: 'HR', crit: 3, users: 4500 }
  ];

  const insertService = db.prepare('INSERT INTO services (name, category, criticality_score, user_count_estimate) VALUES (?, ?, ?, ?)');
  SERVICES.forEach(s => insertService.run(s.name, s.category, s.crit, s.users));

  // Maps for IDs
  const serviceIds = {};
  const getServiceId = db.prepare("SELECT id FROM services WHERE name = ?");
  SERVICES.forEach(s => serviceIds[s.name] = getServiceId.get(s.name).id);

  // 2. Alternatives (Rich Data)
  const insertAlt = db.prepare('INSERT INTO alternatives (service_id, issue_type, description) VALUES (?, ?, ?)');

  insertAlt.run(serviceIds['Corporate Email (Exchange)'], 'Server', 'Use Outlook Web Access (OWA) via the backup URL: https://owa-backup.corp.com');
  insertAlt.run(serviceIds['Corporate Email (Exchange)'], 'Client', 'Restart Outlook in Safe Mode (Hold Ctrl while opening).');

  insertAlt.run(serviceIds['VPN Gateway - US East'], 'Network', 'Connect to "VPN Gateway - EU West" temporarily.');
  insertAlt.run(serviceIds['VPN Gateway - US East'], 'Auth', 'Use the legacy 2FA token generator.');

  insertAlt.run(serviceIds['Payroll System (SAP)'], 'Database', 'Manual timesheet entry forms are available on the Intranet Homepage.');

  insertAlt.run(serviceIds['Office WiFi (HQ)'], 'Network', 'Use the "Guest" network or hardline ethernet if available.');

  insertAlt.run(serviceIds['JIRA Issue Tracker'], 'Access', 'Use the read-only mirror at jira-backup.internal.');

  insertAlt.run(serviceIds['Slack Messaging'], 'App', 'Use the web browser version (slack.com) instead of the desktop app.');

  // Helper to create dates
  const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  const insertTicket = db.prepare(`
        INSERT INTO tickets (incident_id, title, description, service_id, status, priority, impact_score, created_at, resolved_at, root_cause, root_cause_category, eta_override) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

  // 3. ACTIVE INCIDENTS (Visible on Dashboard)
  insertTicket.run('INC-2025-001', 'Outlook Disconnected for Remote Users', 'Users reporting inability to send/receive emails.', serviceIds['Corporate Email (Exchange)'], 'In Progress', 'Critical', 95, hoursAgo(2), null, null, null, '45 mins');
  insertTicket.run('INC-2025-002', 'VPN Auth Timeout', 'Authentication server is timing out.', serviceIds['VPN Gateway - US East'], 'Diagnosing', 'High', 80, hoursAgo(0.5), null, null, null, '1.5 hours');
  insertTicket.run('INC-2025-003', 'WiFi Intermittent in Main Lobby', 'Signal dropping in and out.', serviceIds['Office WiFi (HQ)'], 'Open', 'Medium', 40, hoursAgo(4), null, null, null, '3 hours');
  insertTicket.run('INC-2025-004', 'Slack Messages Delayed', 'Messages taking 5+ mins to deliver.', serviceIds['Slack Messaging'], 'Open', 'Low', 20, hoursAgo(0.2), null, null, null, 'Unknown');

  // 4. RESOLVED INCIDENTS (For Stats)
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
      'Server',
      null
    );
  }

  console.log('Database Initialized with Full Dataset.');
  return db;
}

module.exports = { initDB };
