import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
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


// DB Connection
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test DB connection
db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
