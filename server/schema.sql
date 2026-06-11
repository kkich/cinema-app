CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_path TEXT
);

CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre INTEGER NOT NULL,
    ticket_price INTEGER NOT NULL,
    age_rating INTEGER NOT NULL,
    description TEXT,
    poster_path TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    total_price INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);