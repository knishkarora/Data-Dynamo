const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Item One', description: 'First item from backend' },
      { id: 2, name: 'Item Two', description: 'Second item from backend' },
      { id: 3, name: 'Item Three', description: 'Third item from backend' },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});