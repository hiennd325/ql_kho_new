const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Import routes
const authRoutes = require('./auth');
const productRoutes = require('./product');
const inventoryRoutes = require('./inventory');
const userRoutes = require('./user');
const reportRoutes = require('./report');
const dashboardRoutes = require('./dashboard');
const warehouseRoutes = require('./warehouse');
const transferRoutes = require('./transfers');
const supplierRoutes = require('./supplier');
const ordersRoutes = require('./orders');
const notificationRoutes = require('./notifications');
const aiRoutes = require('./ai');

// Root API v1 route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to QL Kho API v1', version: '1.0.0' });
});

// Auth routes (public)
router.use('/auth', authRoutes);

// Protected routes
router.use('/products', authenticate, productRoutes);
router.use('/inventory', authenticate, inventoryRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/warehouses', authenticate, warehouseRoutes);
router.use('/transfers', authenticate, transferRoutes);
router.use('/suppliers', authenticate, supplierRoutes);
router.use('/orders', authenticate, ordersRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/ai', authenticate, aiRoutes);

module.exports = router;
