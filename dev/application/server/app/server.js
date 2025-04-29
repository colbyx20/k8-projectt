const express = require('express')
const app = express()
const { Pool } = require('pg');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname,'./config/.env')})

app.use(express.json());
const VERSION = process.env.VERSION || "1.0.0"
const PORT = process.env.PORT || 3000
const ENV = process.env.ENV || "test"


const pool = new Pool({
  // host: process.env.PGHOST || 'postgres-service.dev.svc.cluster.local',
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'testuser',
  password: process.env.PGPASS || 'testpass',
  database: process.env.PGDB || 'testdb',
  port: process.env.PGPORT || 5432,
});


app.get("/", (req, res) => {
  res.send(`Hello from Kubernetes version : ${VERSION}, ${ENV} environment`)
})


app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/healthz', (req, res) => {
  res.status(200).send('Healthz Check Success')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${ENV} environment`)
})