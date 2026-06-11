const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/tickets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { movie_id, show_date, quantity } = req.body;

    if (!movie_id || !show_date || !quantity) {
      return res.status(400).json({
        message: 'Все поля обязательны',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: 'Количество билетов должно быть больше нуля',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const showDate = new Date(show_date);
    showDate.setHours(0, 0, 0, 0);

    if (showDate < today) {
      return res.status(400).json({
        message: 'Дата сеанса не может быть в прошлом',
      });
    }

    const movieResult = await pool.query(
      'SELECT id, ticket_price FROM movies WHERE id = $1',
      [movie_id]
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Фильм не найден',
      });
    }

    const movie = movieResult.rows[0];
    const totalPrice = movie.ticket_price * quantity;

    const ticketResult = await pool.query(
      `INSERT INTO tickets
       (user_id, movie_id, show_date, quantity, total_price, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [userId, movie_id, show_date, quantity, totalPrice]
    );

    return res.status(201).json({
      message: 'Билет успешно куплен',
      ticket: ticketResult.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
});
router.post('/tickets/:id/refund', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.id;

    const ticketResult = await pool.query(
      `SELECT *
       FROM tickets
       WHERE id = $1 AND user_id = $2`,
      [ticketId, userId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Билет не найден',
      });
    }

    if (ticketResult.rows[0].status === 'refunded') {
      return res.status(400).json({
        message: 'Билет уже возвращён',
      });
    }

    await pool.query(
      `UPDATE tickets
       SET status = 'refunded'
       WHERE id = $1 AND user_id = $2`,
      [ticketId, userId]
    );

    return res.json({
      message: 'Возврат билета оформлен',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
});
module.exports = router;