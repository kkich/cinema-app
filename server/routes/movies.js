const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/movies', async (req, res) => {
  try {
    const { genre, age_rating, sort } = req.query;

    let query = 'SELECT * FROM movies WHERE 1=1';
    const values = [];

    if (genre) {
      values.push(genre);
      query += ` AND genre = $${values.length}`;
    }

    if (age_rating) {
      values.push(age_rating);
      query += ` AND age_rating = $${values.length}`;
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY ticket_price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY ticket_price DESC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const result = await pool.query(query, values);

    return res.json(result.rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
});

module.exports = router;