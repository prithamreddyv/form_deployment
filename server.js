import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// DB Connection
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Routes
app.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM users');
  res.render('register', { users: rows });
});

app.post('/register', async (req, res) => {
  const { name, age, gender, country } = req.body;
  await db.query('INSERT INTO users (name, age, gender, country) VALUES (?, ?, ?, ?)', [name, age, gender, country]);
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { name, age } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE name = ? AND age = ?', [name, age]);

  if (rows.length > 0) {
    req.session.user = rows[0]; // Store user in session
    res.redirect('/profile');
  } else {
    res.render('login', { error: 'Invalid name or age' });
  }
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    
    return res.redirect('/login');
  }
  console.log("session info ",req.session.user);
  res.render('profile', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
