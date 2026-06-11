const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const ticketsRoutes = require('./routes/tickets');
const profileRoutes = require('./routes/profile');

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);
app.use('/api', authRoutes);
app.use('/api', moviesRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', profileRoutes);

app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      success: true,
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});