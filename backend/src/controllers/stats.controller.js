const db = require('../config/db');

const getUserStats = async (req, res) => {
    try {
        const [stats] = await db.query('SELECT * FROM user_stats WHERE user_id = ?', [req.user.id]);
        if (stats.length === 0) return res.json({ items_rescued: 0, total_money_saved: 0, total_co2_saved_kg: 0, streak_days: 0, level: 1 });
        
        const userStat = stats[0];
        const level = Math.floor(userStat.items_rescued / 5) + 1;
        
        res.json({
            items_rescued: userStat.items_rescued,
            money_saved: parseFloat(userStat.total_money_saved),
            co2_saved_kg: parseFloat(userStat.total_co2_saved_kg),
            streak_days: userStat.streak_days || 0,
            level
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const [leaders] = await db.query(`
            SELECT u.id, u.full_name, u.role, us.items_rescued, us.total_co2_saved_kg, us.total_money_saved, us.streak_days
            FROM user_stats us
            JOIN users u ON us.user_id = u.id
            WHERE us.items_rescued > 0
            ORDER BY us.items_rescued DESC
            LIMIT 20
        `);

        const leaderboard = leaders.map((leader, index) => ({
            rank: index + 1,
            id: leader.id,
            name: leader.full_name,
            role: leader.role,
            items_rescued: leader.items_rescued,
            co2_saved_kg: parseFloat(leader.total_co2_saved_kg),
            money_saved: parseFloat(leader.total_money_saved),
            streak_days: leader.streak_days || 0
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getGlobalStats = async (req, res) => {
    try {
        const [totalMeals] = await db.query('SELECT COALESCE(SUM(items_rescued), 0) as total FROM user_stats');
        const [totalCO2] = await db.query('SELECT COALESCE(SUM(total_co2_saved_kg), 0) as total FROM user_stats');
        const [totalPartners] = await db.query('SELECT COUNT(*) as total FROM restaurants');
        const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users');
        const [totalMoney] = await db.query('SELECT COALESCE(SUM(total_money_saved), 0) as total FROM user_stats');

        res.json({
            meals_rescued: totalMeals[0].total,
            co2_saved_kg: parseFloat(totalCO2[0].total),
            partners: totalPartners[0].total,
            users: totalUsers[0].total,
            money_saved: parseFloat(totalMoney[0].total)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getUserStats, getLeaderboard, getGlobalStats };
