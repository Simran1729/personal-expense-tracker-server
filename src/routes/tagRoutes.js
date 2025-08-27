const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/create-tag', authMiddleware, tagController.createTag);

router.post('/delete-tag', authMiddleware, tagController.deleteTag);

router.post('/update-tag', authMiddleware, tagController.updateTag);

router.get('/read-tags', authMiddleware, tagController.readTags)

module.exports = router;