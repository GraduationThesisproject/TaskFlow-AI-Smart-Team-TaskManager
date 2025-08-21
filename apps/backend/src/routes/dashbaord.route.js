const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { getDashboardOverviewHome } = require('../controllers/DashboardControllers/home.controller');

// home routes

router.get('/home/:userId',/* authMiddleware ,*/ getDashboardOverviewHome);

module.exports = router;