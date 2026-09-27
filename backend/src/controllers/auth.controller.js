const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    try {
        const { full_name, email, password, role, phone, latitude, longitude } = req.body;
        
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email in use' });
        
        const id = randomUUID();
        const password_hash = await bcrypt.hash(password, 10);
        
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            await connection.query(
                'INSERT INTO users (id, full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
                [id, full_name, email, password_hash, role, phone]
            );
            
            if (role === 'student' || role === 'ngo') {
                await connection.query('INSERT INTO user_stats (user_id) VALUES (?)', [id]);
            } else if (role === 'merchant') {
                const rest_id = randomUUID();
                const lat = latitude || 0;
                const lng = longitude || 0;
                await connection.query(
                    'INSERT INTO restaurants (id, owner_id, business_name, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
                    [rest_id, id, full_name + " Restaurant", lat, lng]
                );
            }
            
            await connection.commit();
            
            const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ token, user: { id, full_name, email, role } });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        delete user.password_hash;
        res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login };
