const express = require('express');
const db = require('../config/db');

const router = express.Router();

if (process.env.NODE_ENV !== 'production') {
    router.post('/fast-forward', async (req, res) => {
        try {
            await db.query('UPDATE surplus_listings SET pickup_end_time = DATE_SUB(NOW(), INTERVAL 10 HOUR) WHERE status="active"');
            res.json({ message: 'Fast forwarded time by 10 hours for active listings' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

module.exports = router;
