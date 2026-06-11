const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Можно загружать только JPG или PNG'));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT
        id,
        username,
        full_name,
        avatar_path
      FROM users
      WHERE id = $1`,
      [userId]
    );

    const ticketsResult = await pool.query(
      `SELECT
        tickets.id,
        tickets.show_date,
        tickets.quantity,
        tickets.total_price,
        tickets.status,
        movies.title
      FROM tickets
      JOIN movies
        ON movies.id = tickets.movie_id
      WHERE tickets.user_id = $1
      ORDER BY tickets.id DESC`,
      [userId]
    );

    return res.json({
      user: userResult.rows[0],
      tickets: ticketsResult.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
});
router.post(
  '/profile/avatar',
  authMiddleware,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          message: 'Файл не загружен',
        });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      await pool.query(
        `UPDATE users
         SET avatar_path = $1
         WHERE id = $2`,
        [avatarPath, userId]
      );

      return res.json({
        message: 'Аватар обновлён',
        avatar_path: avatarPath,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Ошибка сервера',
      });
    }
  }
);
module.exports = router;