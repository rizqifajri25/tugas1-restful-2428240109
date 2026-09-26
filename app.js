const express = require('express');
const app = express();
const PORT = 3000;

// Middleware agar req.body (JSON) dapat dibaca
app.use(express.json());

// Data sementara (disimpan di memori, hilang saat server restart)
let menu = [
    { id: 1, nama: 'Es Teh Manis', kategori: 'Minuman', harga: "5000", tersedia: "true", pedas: "false" },
    { id: 2, nama: 'Brown Sugar Boba', kategori: 'Minuman', harga: "10000", tersedia: "true", pedas: "false" },
    { id: 3, nama: 'Croissant', kategori: 'Makanan', harga: "15000", tersedia: "false", pedas: "false" },
    { id: 4, nama: 'Kentang Goreng', kategori: 'Makanan', harga: "10000", tersedia: "true", pedas: "false" },
    { id: 5, nama: 'Mie Ayam Pedas', kategori: 'Makanan', harga: "15000", tersedia: "true", pedas: "true" }
];
let nextId = 6;

// GET / -> memastikan server berjalan
app.get('/', (req, res) => {
    res.send('Server Express.js berjalan!');
});

// GET /menu-items -> seluruh data, bisa difilter: /menu-items?kategori=Minuman
app.get('/menu-items', (req, res) => {

    const { kategori } = req.query;
    const { tersedia } = req.query;
    const { pedas } = req.query;

    if (kategori || tersedia || pedas) {
        const hasil = menu.filter((m) => m.kategori === kategori || m.tersedia === tersedia || m.pedas === pedas);
        return res.json(hasil);
    }

    res.json(menu);
});

// GET /menu-items/:id -> satu data berdasarkan id
app.get('/menu-items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = menu.find((m) => m.id === id);

    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(data);
});

// POST /menu-items -> tambah data baru
app.post('/menu-items', (req, res) => {
    const { nama, kategori, harga, tersedia, pedas } = req.body;

    if (!nama || !kategori || !harga || !tersedia || !pedas) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const baru = { id: nextId++, nama, kategori, harga, tersedia, pedas };
    menu.push(baru);
    res.status(201).json(baru);
});

// PUT /menu-items/:id -> ubah data
app.put('/menu-items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = menu.findIndex((m) => m.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    menu[index] = { ...menu[index], ...req.body, id };
    res.json(menu[index]);
});

// DELETE /menu-items/:id -> hapus data
app.delete('/menu-items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = menu.findIndex((m) => m.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    menu.splice(index, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});