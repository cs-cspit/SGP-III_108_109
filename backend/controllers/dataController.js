const Camera = require('../models/dataModel');

// Get all cameras
exports.getAllCameras = async (req, res) => {
    try {
        const cameras = await Camera.find();
        res.json(cameras);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a new camera
exports.addCamera = async (req, res) => {
    try {
        const { name, price, rating, image_url } = req.body;
        const camera = new Camera({ name, price, rating, image_url });
        await camera.save();
        res.status(201).json(camera);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};