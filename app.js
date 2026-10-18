require('dotenv').config();

const express = require('express');

const menuItemsRoutes = require('./routes/menuItemsRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server Express.js berjalan!');
});

app.use('/menu-items', menuItemsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
