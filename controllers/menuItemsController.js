const menuItemsModel = require('../models/menuItemsModel');

exports.getAll = (req, res) => {
    const { kategori, tersedia, pedas } = req.query;

    res.json(menuItemsModel.getAll({ kategori, tersedia, pedas }));
};

exports.getById = (req, res) => {
    const id = parseInt(req.params.id);
    const data = menuItemsModel.getById(id);

    if (!data) {
        return res.status(404).json({
            status: 'error',
            message: 'Data tidak ditemukan',
            data: null
        });
    }

    res.json(data);
};

exports.create = (req, res) => {
    const { nama, kategori, harga, tersedia, pedas } = req.body;

    if (
        typeof nama !== 'string' ||
        !nama.trim() ||
        typeof kategori !== 'string' ||
        !kategori.trim() ||
        typeof harga !== 'number' ||
        !Number.isFinite(harga) ||
        typeof tersedia !== 'boolean' ||
        typeof pedas !== 'boolean'
    ) {
        return res.status(400).json({
            status: 'error',
            message: 'Semua field wajib diisi dengan tipe data yang valid',
            data: null
        });
    }

    const baru = menuItemsModel.create({
        nama,
        kategori,
        harga,
        tersedia,
        pedas
    });

    return res.status(201).json({
        status: 'success',
        message: 'Data menu berhasil ditambahkan',
        data: baru
    });
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const data = menuItemsModel.update(id, req.body);

    if (!data) {
        return res.status(404).json({
            status: 'error',
            message: 'Data tidak ditemukan',
            data: null
        });
    }

    res.json({
        status: 'success',
        message: 'Data menu berhasil diperbarui',
        data
    });
};

exports.remove = (req, res) => {
    const id = parseInt(req.params.id);
    const berhasil = menuItemsModel.remove(id);

    if (!berhasil) {
        return res.status(404).json({
            status: 'error',
            message: 'Data tidak ditemukan',
            data: null
        });
    }

    res.status(204).send();
};
