const express = require('express');
const app = express();
const PORT = 3000;

// Middleware agar req.body (JSON) dapat dibaca
app.use(express.json());

// Data sementara (disimpan di memori, hilang saat server restart)
let mahasiswa = [
    { id: 1, nama: 'Andi', jurusan: 'Sistem Informasi' },
    { id: 2, nama: 'Budi', jurusan: 'Informatika' },
];
let nextId = 3;

// GET / -> memastikan server berjalan
app.get('/', (req, res) => {
    res.send('Server Express.js berjalan!');
});

// GET /mahasiswa -> seluruh data, bisa difilter: /mahasiswa?jurusan=Informatika
app.get('/mahasiswa', (req, res) => {
    const { jurusan } = req.query;

    if (jurusan) {
        const hasil = mahasiswa.filter((m) => m.jurusan === jurusan);
        return res.json(hasil);
    }

    res.json(mahasiswa);
});

// GET /mahasiswa/:id -> satu data berdasarkan id
app.get('/mahasiswa/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = mahasiswa.find((m) => m.id === id);

    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(data);
});

// POST /mahasiswa -> tambah data baru
app.post('/mahasiswa', (req, res) => {
    const { nama, jurusan } = req.body;

    if (!nama || !jurusan) {
        return res.status(400).json({ message: 'nama dan jurusan wajib diisi' });
    }

    const baru = { id: nextId++, nama, jurusan };
    mahasiswa.push(baru);
    res.status(201).json(baru);
});

// PUT /mahasiswa/:id -> ubah data
app.put('/mahasiswa/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mahasiswa.findIndex((m) => m.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    mahasiswa[index] = { ...mahasiswa[index], ...req.body, id };
    res.json(mahasiswa[index]);
});

// DELETE /mahasiswa/:id -> hapus data
app.delete('/mahasiswa/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mahasiswa.findIndex((m) => m.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    mahasiswa.splice(index, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});