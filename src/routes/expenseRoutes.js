const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const expenseController = require('../controllers/expenseController');

router.get('/read-expense', authMiddleware, expenseController.readExpense);

router.post('/create-expense', authMiddleware, expenseController.createExpense);

router.put('/update-expense/:id', authMiddleware, expenseController.updateExpense);

router.delete('/delete-expense/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;