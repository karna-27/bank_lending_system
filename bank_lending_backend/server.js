// Main Express application setup

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loanRoutes = require('./src/routes');
const { initDb } = require('./src/database');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || './data/bank.db';

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins, allowing frontend to connect

app.use('/api/v1', loanRoutes); // Mount API routes

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Initialize DB and start server
initDb(DB_PATH)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Database at: ${DB_PATH}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });