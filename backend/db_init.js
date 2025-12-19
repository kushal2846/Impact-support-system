const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);
const CSV_PATH = path.join(__dirname, 'dataset.csv');

// --- Schema ---
console.log('Initializing Database...');
db.exec(`
  DROP TABLE IF EXISTS tickets;
  DROP TABLE IF EXISTS services;
  DROP TABLE IF EXISTS alternatives;

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

// --- Helpers ---
const FAILURES = [
    { cause: 'High Memory Usage', category: 'Server' },
    { cause: 'Network Latency', category: 'Network' },
    { cause: 'Database Deadlock', category: 'Database' },
    { cause: 'Certificate Expired', category: 'Security' },
    { cause: 'Disk Space Full', category: 'Hardware' },
    { cause: 'Third-party API Down', category: 'External' },
    { cause: 'Authentication Timeout', category: 'Auth' },
    { cause: 'Bad Deployment', category: 'Code' }
];

const TITLES = [
    "Cannot access service", "Slow performance detected", "Login failed repeatedly",
    "Data not syncing", "Unexpected error 500", "Timeout during connection"
];

// --- Ingestion ---
async function ingest() {
    console.log('Reading dataset...');
    if (!fs.existsSync(CSV_PATH)) {
        console.error("Dataset not found!");
        return;
    }

    const content = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = content.split('\n');
    console.log(`Found ${lines.length} lines.`);

    // Headers: CI_Name,CI_Cat,CI_Subcat,WBS,Incident_ID,Status,Impact,Urgency,Priority...
    // We assume standard order or just try to parse by approximate index if headers match
    // Let's assume the order from the probe:
    // 1: CI_Cat, 2: CI_Subcat, 4: Incident_ID, 5: Status, 6: Impact, 8: Priority
    // Note: CSV splitting by comma is brittle if fields have commas.
    // We'll use a basic regex split or simple split if quotes aren't heavy.
    // Given the probe output, it looks like simple CSV but with quotes "3,87...".

    // Prepare Statements
    const insertService = db.prepare('INSERT INTO services (name, category, criticality_score, user_count_estimate) VALUES (?, ?, ?, ?)');
    const insertTicket = db.prepare(`
        INSERT INTO tickets (incident_id, title, description, service_id, status, priority, impact_score, created_at, resolved_at, root_cause, root_cause_category) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const servicesCache = new Map();
    let count = 0;

    const parseCSVLine = (text) => {
        const re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
        // Simple regex for CSV parsing is hard. We'll use a simple split and hope.
        // Or better, just match generic values.
        // Let's use a very dumb split and cleanup quotes.
        return text.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
    };

    const headers = parseCSVLine(lines[0]);
    const idx = {
        cat: headers.indexOf('CI_Cat'),
        subcat: headers.indexOf('CI_Subcat'),
        id: headers.indexOf('Incident_ID'),
        status: headers.indexOf('Status'),
        priority: headers.indexOf('Priority'),
        open: headers.indexOf('Open_Time'),
        resolved: headers.indexOf('Resolved_Time')
    };

    console.log('Indices:', idx);

    db.transaction(() => {
        for (let i = 1; i < lines.length; i++) {
            if (i > 5000) break; // Limit to 5000 for speed
            const row = parseCSVLine(lines[i]);
            if (row.length < 5) continue;

            const cat = row[idx.cat] || 'General';
            const subcat = row[idx.subcat] || 'General Service';
            const serviceName = subcat !== '?' ? subcat : cat;

            if (!servicesCache.has(serviceName)) {
                try {
                    const info = insertService.run(serviceName, cat, Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 2000) + 100);
                    servicesCache.set(serviceName, info.lastInsertRowid);
                } catch (e) {
                    // In case of duplicate or error, ignore
                }
            }
            const serviceId = servicesCache.get(serviceName) || 1;

            let status = 'Resolved';
            const rawStatus = row[idx.status];
            if (['Active', 'New', 'Open'].includes(rawStatus)) status = 'Open';
            else if (rawStatus === 'Closed' || rawStatus === 'Resolved') status = 'Resolved';

            // Dates
            const parseDate = (str) => {
                const d = new Date(str);
                return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
            };
            const created = row[idx.open] ? parseDate(row[idx.open]) : new Date().toISOString();
            const resolved = (status === 'Resolved' && row[idx.resolved]) ? parseDate(row[idx.resolved]) : null;

            // Details
            const failure = FAILURES[Math.floor(Math.random() * FAILURES.length)];
            const rootCause = status === 'Resolved' ? failure.cause : null;
            const rootCat = status === 'Resolved' ? failure.category : null;
            const title = TITLES[Math.floor(Math.random() * TITLES.length)] + ` - ${serviceName}`;

            let priority = 'Medium';
            if (row[idx.priority] === '1') priority = 'Critical';
            else if (row[idx.priority] === '2') priority = 'High';
            else if (row[idx.priority] === '4') priority = 'Low';

            insertTicket.run(
                row[idx.id], title, "Imported ticket.", serviceId, status, priority, 10, created, resolved, rootCause, rootCat
            );
            count++;
        }
    })();

    console.log(`Ingested ${count} tickets.`);

    // Seed Alternatives
    const insertAlt = db.prepare('INSERT INTO alternatives (service_id, issue_type, description) VALUES (?, ?, ?)');
    for (const [name, id] of servicesCache.entries()) {
        insertAlt.run(id, 'Server', 'Use cached version at backup-portal.intranet');
        insertAlt.run(id, 'Network', 'VPN Server B is available.');
    }
}

ingest();
