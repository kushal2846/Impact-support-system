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

    // Seed Data
    console.log('Seeding Data...');
    const SERVICES = [
        { name: 'Corporate Email (Exchange)', category: 'Communication', crit: 5, users: 4500 },
        { name: 'VPN Gateway - US East', category: 'Network', crit: 4, users: 1200 },
        { name: 'Payroll System (SAP)', category: 'Finance', crit: 5, users: 400 },
        { name: 'Office WiFi (HQ)', category: 'Network', crit: 3, users: 600 }
    ];

    const insertService = db.prepare('INSERT OR IGNORE INTO services (name, category, criticality_score, user_count_estimate) VALUES (?, ?, ?, ?)');
    SERVICES.forEach(s => insertService.run(s.name, s.category, s.crit, s.users));

    // Maps for IDs
    const serviceIds = {};
    const getServiceId = db.prepare("SELECT id FROM services WHERE name = ?");
    SERVICES.forEach(s => serviceIds[s.name] = getServiceId.get(s.name).id);

    // Seed Active Ticket
    db.prepare(`
        INSERT INTO tickets (incident_id, title, description, service_id, status, priority, impact_score, created_at, eta_override) 
        VALUES ('INC-DEMO-001', 'Outlook Disconnected', 'Cannot send emails.', ?, 'In Progress', 'Critical', 95, ?, '45 mins')
    `).run(serviceIds['Corporate Email (Exchange)'], new Date().toISOString());

    console.log('Database Initialized.');
    return db;
}

module.exports = { initDB };
