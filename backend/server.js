const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB
const db = initDB();

// --- Helpers ---
const getETA = (serviceId, priority, override) => {
    if (override) return override;
    return '2 hours (est)';
};

// --- Routes ---
app.get('/', (req, res) => {
    res.send('Impact Support System API is Running');
});

// Active Impact Center
app.get('/api/active-impacts', (req, res) => {
    try {
        const activeTickets = db.prepare(`
            SELECT t.*, s.name as service_name, s.category as service_category 
            FROM tickets t 
            JOIN services s ON t.service_id = s.id 
            WHERE t.status != 'Resolved'
            ORDER BY t.impact_score DESC
        `).all();

        const impacts = activeTickets.map(ticket => {
            const alternatives = db.prepare("SELECT * FROM alternatives WHERE service_id = ?").all(ticket.service_id);
            const predictedCause = ticket.root_cause || 'Under Investigation';

            return {
                ...ticket,
                root_cause_display: predictedCause,
                eta_display: getETA(ticket.service_id, ticket.priority, ticket.eta_override),
                alternatives: alternatives
            };
        });
        res.json(impacts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB Error' });
    }
});

// Search Deflection
app.get('/api/search-deflection', (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 3) return res.json({ matches: [], alternatives: [] });

    try {
        const activeMatches = db.prepare(`
            SELECT t.id, t.incident_id, t.title, t.status 
            FROM tickets t 
            WHERE t.status != 'Resolved' AND (t.title LIKE ? OR t.description LIKE ?)
            LIMIT 3
        `).all(`%${q}%`, `%${q}%`);

        const altMatches = db.prepare(`
            SELECT a.description, s.name 
            FROM alternatives a 
            JOIN services s ON a.service_id = s.id 
            WHERE s.name LIKE ? OR a.issue_type LIKE ?
            LIMIT 2
        `).all(`%${q}%`, `%${q}%`);

        res.json({ existing_incidents: activeMatches, suggestions: altMatches });
    } catch (e) {
        res.json({ matches: [], alternatives: [] });
    }
});

// Activity Log
app.get('/api/activity-log', (req, res) => {
    try {
        const activity = db.prepare(`
            SELECT 'created' as type, title, incident_id, created_at as time FROM tickets ORDER BY created_at DESC LIMIT 5
        `).all();
        res.json(activity);
    } catch (e) {
        res.json([]);
    }
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
    try {
        const totalOpen = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status != 'Resolved'").get().count;
        const avgResTime = 2.4; // simpler for demo
        const highImpact = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'Critical' AND status != 'Resolved'").get().count;
        const servicesAffected = db.prepare(`
            SELECT s.name, COUNT(t.id) as ticket_count 
            FROM tickets t JOIN services s ON t.service_id = s.id 
            WHERE t.status != 'Resolved' GROUP BY s.name ORDER BY ticket_count DESC LIMIT 5
        `).all();

        res.json({
            totalOpen,
            avgResolutionHours: avgResTime,
            criticalTickets: highImpact,
            affectedServices: servicesAffected
        });
    } catch (e) {
        res.status(500).json({ error: 'DB Error' });
    }
});

// Standard CRUD
app.get('/api/tickets', (req, res) => {
    const { status, limit } = req.query;
    let query = "SELECT t.*, s.name as service_name FROM tickets t JOIN services s ON t.service_id = s.id";
    const params = [];
    if (status) { query += " WHERE t.status = ?"; params.push(status); }
    query += " ORDER BY t.created_at DESC";
    if (limit) query += ` LIMIT ${limit}`;
    res.json(db.prepare(query).all(...params));
});

app.get('/api/tickets/:id', (req, res) => {
    const ticket = db.prepare("SELECT t.*, s.name as service_name, s.criticality_score, s.user_count_estimate FROM tickets t JOIN services s ON t.service_id = s.id WHERE t.id = ?").get(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    const alternatives = db.prepare("SELECT * FROM alternatives WHERE service_id = ?").all(ticket.service_id);
    res.json({ ...ticket, eta: '2 hours', alternatives });
});

app.post('/api/tickets', (req, res) => {
    const { title, description, service_id, priority } = req.body;
    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(service_id);
    const impact = service.criticality_score * service.user_count_estimate;
    const stmt = db.prepare(`INSERT INTO tickets (incident_id, title, description, service_id, status, priority, impact_score, created_at) VALUES (?, ?, ?, ?, 'Open', ?, ?, ?)`);
    const id = `INC-${Date.now()}`;
    stmt.run(id, title, description, service_id, priority, impact, new Date().toISOString());
    res.json({ success: true });
});

app.get('/api/services', (req, res) => {
    res.json(db.prepare("SELECT * FROM services").all());
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
