const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, full_name } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({
        message: 'Все поля обязательны',
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'Пользователь с таким логином уже существует',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, username, full_name, avatar_path`,
      [username, passwordHash, full_name]
    );

    return res.status(201).json({
      message: 'Регистрация прошла успешно',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Введите логин и пароль',
      });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: 'Неверный логин или пароль',
      });
    }

    const user = userResult.rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    return res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar_path: user.avatar_path,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
});
module.exports = router;