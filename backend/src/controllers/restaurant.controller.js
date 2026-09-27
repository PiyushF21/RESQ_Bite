const db = require('../config/db');

const getRestaurantProfile = async (req, res) => {
    try {
        const [restaurants] = await db.query(
            'SELECT * FROM restaurants WHERE owner_id = ?',
            [req.user.id]
        );

        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'No restaurant found' });
        }

        res.json(restaurants[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateRestaurantProfile = async (req, res) => {
    try {
        const { business_name, address, phone, cuisine_type, description, latitude, longitude } = req.body;

        const [restaurants] = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [req.user.id]);
        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'No restaurant found' });
        }

        await db.query(
            `UPDATE restaurants SET 
                business_name = COALESCE(?, business_name),
                address = COALESCE(?, address),
                phone = COALESCE(?, phone),
                cuisine_type = COALESCE(?, cuisine_type),
                description = COALESCE(?, description),
                latitude = COALESCE(?, latitude),
                longitude = COALESCE(?, longitude)
            WHERE owner_id = ?`,
            [business_name, address, phone, cuisine_type, description, latitude, longitude, req.user.id]
        );

        const [updated] = await db.query('SELECT * FROM restaurants WHERE owner_id = ?', [req.user.id]);
        res.json(updated[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const [restaurants] = await db.query(
            `SELECT r.*, 
                    (SELECT COUNT(*) FROM surplus_listings WHERE restaurant_id = r.id AND status = 'active') as active_listings
             FROM restaurants r WHERE r.id = ?`,
            [req.params.id]
        );

        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json(restaurants[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getRestaurantProfile, updateRestaurantProfile, getRestaurantById };
