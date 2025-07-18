require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/authMiddleware');

const app = express();
app.use(bodyParser.json());

const { PORT, MONGO_URI } = process.env;

mongoose.connect(MONGO_URI, {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Protected test route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.mobile}` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
