const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/cameras', dataController.getAllCameras);
router.post('/cameras', dataController.addCamera);

module.exports = router;