const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/create-tag', authMiddleware, tagController.createTag);

router.delete('/delete-tag/:id', authMiddleware, tagController.deleteTag);

router.put('/update-tag/:id', authMiddleware, tagController.updateTag);

router.get('/read-tags', authMiddleware, tagController.readTags)

module.exports = router;