const express = require('express');
const { getUserStats, getLeaderboard, getGlobalStats } = require('../controllers/stats.controller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getUserStats);
router.get('/leaderboard', verifyToken, getLeaderboard);
router.get('/global', getGlobalStats);

module.exports = router;
