// Example using Express.js

const express = require('express');
const app = express();
const { Pool } = require('pg'); // PostgreSQL client

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '1234',
  port: 5432, // default PostgreSQL port
});

app.use(express.json());

app.post('/api/events', async (req, res) => {
  const { title, day, startTime, endTime, location } = req.body;

  try {
    const query = `
      INSERT INTO events (title, day, start_time, end_time, location)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, day, startTime, endTime, location];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000')
});



app.get('/api/events', async (req, res) => {
  try {
    const query = 'SELECT * FROM events;';
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});



app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Attempting to delete event with id: ${id}`); // Additional log
    const query = 'DELETE FROM events WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      console.log('Event not found in database'); // Additional log
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Event deleted successfully:', result.rows[0]); // Additional log
    res.status(200).json({ message: 'Event deleted successfully', event: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err.message); // Enhanced log
    res.status(500).json({ error: 'Database error' });
  }
});


