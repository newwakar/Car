const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createPool({
    host: 'localhost',
    user: 'vizagtk__yMCN8E3t_VSrgs7kZKDj7cTuwfemxOtG', 
    password: 'YOUR_PASSWORD_HERE', 
    database: 'vizagtk__fleet_travels',
    waitForConnections: true,
    connectionLimit: 10
});

// Admin Static Credentials Check
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// API: Handle Login Routing (Both Driver & Admin Contexts)
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;
    
    if (role === 'admin') {
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            return res.json({ success: true, role: 'admin', name: 'System Administrator' });
        }
        return res.status(401).json({ error: 'Invalid admin credentials' });
    } else {
        db.query('SELECT * FROM car_status WHERE driver_username = ? AND driver_password = ?', [username, password], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                return res.json({ success: true, role: 'driver', car_name: results[0].car_name, driver_name: results[0].driver_name });
            }
            res.status(401).json({ error: 'Invalid driver credentials' });
        });
    }
});

// API: Update GPS Coordinates
app.post('/api/gps/update', (req, res) => {
    const { car_name, latitude, longitude } = req.body;
    db.query('UPDATE car_status SET latitude = ?, longitude = ? WHERE car_name = ?', [latitude, longitude, car_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// API: Fetch All Car Statuses
app.get('/api/fleet/status', (req, res) => {
    db.query('SELECT * FROM car_status', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API: Create Booking with Date Matrix
app.post('/api/bookings/create', (req, res) => {
    const { customer_name, pickup_location, drop_location, ride_date } = req.body;
    const query = `INSERT INTO bookings (customer_name, pickup_location, drop_location, ride_date) VALUES (?, ?, ?, ?)`;
    db.query(query, [customer_name, pickup_location, drop_location, ride_date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

app.listen(3000, () => console.log('Fleet API running on http://localhost:3000'));
