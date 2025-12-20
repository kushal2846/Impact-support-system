const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

function initDB() {
  // Check if tables exist
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'").get();
  if (tableExists) return db;

  console.log('Initializing Database Schema...');

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

  // Seed Data (RESTORED GUARANTEED DATA)
  console.log('Seeding Data with GUARANTEED Dataset...');
  const SERVICES = [
    { name: 'Corporate Email (Exchange)', category: 'Communication', crit: 5, users: 4500 },
    { name: 'VPN Gateway - US East', category: 'Network', crit: 4, users: 1200 },
    { name: 'Payroll System (SAP)', category: 'Finance', crit: 5, users: 400 },
    { name: 'Customer Support Portal', category: 'External', crit: 4, users: 8000 },
    { name: 'Office WiFi (HQ)', category: 'Network', crit: 3, users: 600 },
    { name: 'JIRA Issue Tracker', category: 'DevOps', crit: 3, users: 300 },
    { name: 'Slack Messaging', category: 'Communication', crit: 2, users: 4500 }
  ];

  const insertService = db.prepare('INSERT OR IGNORE INTO services (name, category, criticality_score, user_count_estimate) VALUES (?, ?, ?, ?)');
  SERVICES.forEach(s => insertService.run(s.name, s.category, s.crit, s.users));

  // Maps for IDs
  const serviceIds = {};
  const getServiceId = db.prepare("SELECT id FROM services WHERE name = ?");
  SERVICES.forEach(s => serviceIds[s.name] = getServiceId.get(s.name).id);

  // Seed Alternatives
  const insertAlt = db.prepare('INSERT INTO alternatives (service_id, issue_type, description) VALUES (?, ?, ?)');
  insertAlt.run(serviceIds['Corporate Email (Exchange)'], 'Server', 'Use Outlook Web Access (OWA) via the backup URL.');
  insertAlt.run(serviceIds['VPN Gateway - US East'], 'Network', 'Connect to VPN Gateway - US West.');
  insertAlt.run(serviceIds['Payroll System (SAP)'], 'Database', 'Manual timesheet entry forms are available on the Intranet.');
  insertAlt.run(serviceIds['Office WiFi (HQ)'], 'Network', 'Use the "Guest" network or hardline ethernet if available.');

  // Helper to create dates
  const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  const insertTicket = db.prepare(`
        INSERT INTO tickets (incident_id, title, description, service_id, status, priority, impact_score, created_at, resolved_at, root_cause, root_cause_category, eta_override) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

  // ACTIVE INCIDENTS
  insertTicket.run('INC-2025-001', 'Outlook Disconnected for Remote Users', 'Users reporting inability to send/receive emails.', serviceIds['Corporate Email (Exchange)'], 'In Progress', 'Critical', 95, hoursAgo(2), null, null, null, '45 mins');
  insertTicket.run('INC-2025-002', 'VPN Auth Timeout', 'Authentication server is timing out.', serviceIds['VPN Gateway - US East'], 'Diagnosing', 'High', 80, hoursAgo(0.5), null, null, null, '1.5 hours');
  insertTicket.run('INC-2025-003', 'WiFi Intermittent in Main Lobby', 'Signal dropping in and out.', serviceIds['Office WiFi (HQ)'], 'Open', 'Medium', 40, hoursAgo(4), null, null, null, '3 hours');

  // RESOLVED INCIDENTS (For Stats - 50 random)
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
