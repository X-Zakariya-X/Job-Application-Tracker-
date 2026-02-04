const express = require('express');
const router = express.Router();
const verifyToken = require('./authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  res.json({ message: "This is a protected route", user: req.user }); // Responding with a message and user info
});

module.exports = router;
