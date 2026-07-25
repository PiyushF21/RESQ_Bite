require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_mysql_password', // Update if needed
    database: process.env.DB_NAME || 'resq_bite',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { full_name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await dbPool.query(
            `INSERT INTO users (id, full_name, email, password_hash, role) VALUES (UUID(), ?, ?, ?, ?)`,
            [full_name, email, hashedPassword, role]
        );
        
        const [users] = await dbPool.query(`SELECT id FROM users WHERE email = ?`, [email]);
        const newUserId = users[0].id;

        if (role === 'student' || role === 'ngo') {
            await dbPool.query(`INSERT INTO user_stats (user_id) VALUES (?)`, [newUserId]);
        }

        if (role === 'merchant') {
            await dbPool.query(
                `INSERT INTO restaurants (id, owner_id, business_name, address, latitude, longitude, is_verified) 
                 VALUES (UUID(), ?, ?, ?, 40.7128, -74.0060, TRUE)`,
                [newUserId, `${full_name}'s Kitchen`, '123 Campus Drive']
            );
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed. Email might already exist.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await dbPool.query(`SELECT * FROM users WHERE email = ?`, [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        delete user.password_hash;
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==========================================
// LISTINGS & MAP DATA
// ==========================================

// STUDENT ROUTE: Only shows food that has NOT expired yet.
app.get('/api/listings/active', async (req, res) => {
    try {
        const [listings] = await dbPool.query(
            `SELECT sl.*, r.business_name, r.latitude, r.longitude 
             FROM surplus_listings sl
             JOIN restaurants r ON sl.restaurant_id = r.id
             WHERE sl.status = 'active' AND sl.quantity_available > 0 AND sl.pickup_end_time > NOW()
             ORDER BY sl.pickup_end_time ASC`
        );
        res.json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch active listings' });
    }
});

// NGO ROUTE: Only shows food that HAS expired (pickup deadline passed)
app.get('/api/listings/donations', async (req, res) => {
    try {
        const [listings] = await dbPool.query(
            `SELECT sl.*, r.business_name, r.latitude, r.longitude 
             FROM surplus_listings sl
             JOIN restaurants r ON sl.restaurant_id = r.id
             WHERE sl.status = 'active' AND sl.quantity_available > 0 AND sl.pickup_end_time <= NOW()
             ORDER BY sl.pickup_end_time DESC`
        );
        res.json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

// MERCHANT ROUTE: Create a new drop
app.post('/api/listings', async (req, res) => {
    const { merchant_id, item_name, description, quantity_available, base_price, min_price, pickup_end_time } = req.body;
    try {
        let [restaurants] = await dbPool.query(`SELECT id FROM restaurants WHERE owner_id = ?`, [merchant_id]);
        
        // BUG FIX: Auto-generate restaurant if the merchant account was created before Phase 2
        if (restaurants.length === 0) {
            const [user] = await dbPool.query(`SELECT full_name FROM users WHERE id = ?`, [merchant_id]);
            const kitchenName = user.length > 0 ? `${user[0].full_name}'s Kitchen` : 'Campus Kitchen';
            
            await dbPool.query(
                `INSERT INTO restaurants (id, owner_id, business_name, address, latitude, longitude, is_verified) 
                 VALUES (UUID(), ?, ?, '123 Campus Drive', 40.7128, -74.0060, TRUE)`,
                [merchant_id, kitchenName]
            );
            // Fetch the newly created restaurant
            [restaurants] = await dbPool.query(`SELECT id FROM restaurants WHERE owner_id = ?`, [merchant_id]);
        }
        
        const restaurant_id = restaurants[0].id;
        
        // BUG FIX: Format datetime string to prevent MySQL strict mode crash
        const formattedDate = pickup_end_time.replace('T', ' ') + ':00';

        await dbPool.query(
            `INSERT INTO surplus_listings 
             (id, restaurant_id, item_name, description, quantity_available, base_price, min_price, pickup_start_time, pickup_end_time, status) 
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), ?, 'active')`,
            [restaurant_id, item_name, description, quantity_available, base_price, min_price, formattedDate]
        );
        res.status(201).json({ message: 'Listing created successfully' });
    } catch (err) {
        console.error("LISTING ERROR:", err);
        res.status(500).json({ error: 'Database error while creating listing' });
    }
});

// ==========================================
// ORDERS & GAMIFICATION
// ==========================================

// STUDENT CLAIM (Buys 1 item)
app.post('/api/orders/claim', async (req, res) => {
    const { user_id, listing_id } = req.body;
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [listings] = await connection.query(
            `SELECT * FROM surplus_listings WHERE id = ? AND quantity_available > 0 AND pickup_end_time > NOW() FOR UPDATE`, 
            [listing_id]
        );
        if (listings.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Item sold out or expired.' });
        }

        const listing = listings[0];

        await connection.query(`UPDATE surplus_listings SET quantity_available = quantity_available - 1 WHERE id = ?`, [listing_id]);
        await connection.query(`INSERT INTO orders (id, user_id, listing_id, status) VALUES (UUID(), ?, ?, 'pending')`, [user_id, listing_id]);

        const moneySaved = parseFloat(listing.base_price) * 1.5; 
        const co2Saved = 2.5;

        await connection.query(
            `UPDATE user_stats SET total_money_saved = total_money_saved + ?, total_co2_saved_kg = total_co2_saved_kg + ?, items_rescued = items_rescued + 1 WHERE user_id = ?`,
            [moneySaved, co2Saved, user_id]
        );

        await connection.commit();
        res.json({ message: 'Item claimed successfully', moneySaved, co2Saved });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Failed to claim item' });
    } finally {
        connection.release();
    }
});

// NGO BULK CLAIM (Claims ALL remaining items for free)
app.post('/api/donations/claim', async (req, res) => {
    const { user_id, listing_id } = req.body;
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [listings] = await connection.query(
            `SELECT * FROM surplus_listings WHERE id = ? AND quantity_available > 0 AND pickup_end_time <= NOW() FOR UPDATE`, 
            [listing_id]
        );
        if (listings.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Donation unavailable or already claimed.' });
        }

        const listing = listings[0];
        const qtyClaimed = listing.quantity_available;

        // Set quantity to 0 and mark as donated
        await connection.query(`UPDATE surplus_listings SET quantity_available = 0, status = 'donated' WHERE id = ?`, [listing_id]);
        
        // Record massive CO2 savings for the NGO
        const co2Saved = 2.5 * qtyClaimed;
        await connection.query(
            `UPDATE user_stats SET total_co2_saved_kg = total_co2_saved_kg + ?, items_rescued = items_rescued + ? WHERE user_id = ?`,
            [co2Saved, qtyClaimed, user_id]
        );

        await connection.commit();
        res.json({ message: 'Donation claimed successfully', qtyClaimed, co2Saved });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Failed to claim donation' });
    } finally {
        connection.release();
    }
});

app.get('/api/users/:id/stats', async (req, res) => {
    try {
        const [stats] = await dbPool.query(`SELECT * FROM user_stats WHERE user_id = ?`, [req.params.id]);
        if (stats.length === 0) return res.json({ level: 1, total_money_saved: 0, total_co2_saved_kg: 0, items_rescued: 0 });
        
        const userStat = stats[0];
        const currentLevel = Math.floor(userStat.items_rescued / 5) + 1;
        res.json({ ...userStat, level: currentLevel });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ==========================================
// DEVELOPER DEMO ROUTE (TIME TRAVEL)
// ==========================================
app.post('/api/demo/fast-forward', async (req, res) => {
    try {
        // Subtracts 10 hours from all active deadlines to force them into the "Expired/Donation" state
        await dbPool.query(`UPDATE surplus_listings SET pickup_end_time = NOW() - INTERVAL 10 HOUR WHERE status = 'active'`);
        res.json({ message: 'Time fast-forwarded! Active items are now expired donations.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fast forward time' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ResQ-Bite Backend Engine running on port ${PORT}`));