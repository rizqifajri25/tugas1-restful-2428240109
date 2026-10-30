require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const menuItemsRoutes = require('./routes/menuItemsRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server Express.js berjalan!');
});

app.use('/menu-items', menuItemsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Gagal terhubung:', err.message);
    process.exit(1);
  });
