
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.sqlite');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      introduction TEXT DEFAULT '',
      report_count INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      seller_id INTEGER NOT NULL,
      report_count INTEGER DEFAULT 0,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_type TEXT NOT NULL, -- 'user' 또는 'product'
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL
    )
  `);
});

app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  db.run(
    `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
    [username, password, email],
    function (err) {
      if (err) {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.json({ message: 'User registered successfully!' });
      }
    }
  );
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, user) => {
      if (user) {
        res.json({ message: 'Login successful!', user });
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    }
  );
});

app.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.put('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const { introduction, password } = req.body;

  db.run(
    `UPDATE users SET introduction = ?, password = ? WHERE id = ?`,
    [introduction, password, userId],
    function (err) {
      if (err) {
        res.status(400).json({ error: 'Error updating profile' });
      } else {
        res.json({ message: 'Profile updated successfully!' });
      }
    }
  );
});

app.post('/products', (req, res) => {
  const { name, price, image, seller_id } = req.body;
  db.run(
    `INSERT INTO products (name, price, image, seller_id) VALUES (?, ?, ?, ?)`,
    [name, price, image, seller_id],
    function (err) {
      if (err) {
        res.status(400).json({ error: 'Error adding product' });
      } else {
        res.json({ message: 'Product added successfully!' });
      }
    }
  );
});

app.get('/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, products) => {
    res.json(products);
  });
});

app.get('/products/:userId', (req, res) => {
  const userId = req.params.userId;
  db.all(`SELECT * FROM products WHERE seller_id = ?`, [userId], (err, products) => {
    res.json(products);
  });
});

app.post('/report', (req, res) => {
  const { target_type, target_id, reason } = req.body;
  db.run(
    `INSERT INTO reports (target_type, target_id, reason) VALUES (?, ?, ?)`,
    [target_type, target_id, reason],
    function (err) {
      if (err) {
        res.status(400).json({ error: 'Error submitting report' });
      } else {
        res.json({ message: 'Report submitted successfully!' });
      }
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
