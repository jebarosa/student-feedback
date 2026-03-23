const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/contact', require('./routes/contact'));

// Root route (ONLY ONE)
app.get('/', (req, res) => {
  res.send("🚀 Student Feedback Backend is Running!");
});

// Start server (ALWAYS LAST)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');

app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);