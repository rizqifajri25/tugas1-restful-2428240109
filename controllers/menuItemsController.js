const menuItemsModel = require('../models/menuItemsModel');

const CREATE_FIELDS = ['nama', 'kategori', 'kategoriId', 'harga', 'tersedia', 'pedas', 'variasi'];
const UPDATE_FIELDS = CREATE_FIELDS;

function errorHttp(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function angkaAman(value, fallback, min, max) {
    const number = Number.parseInt(value, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.min(Math.max(number, min), max);
}

function parseBooleanFilter(value, field) {
    if (value === undefined) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw errorHttp(400, `${field} harus bernilai true atau false`);
}

function parsePrice(value, field) {
    if (value === undefined) return undefined;
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0) {
        throw errorHttp(400, `${field} harus berupa angka nol atau lebih`);
    }
    return price;
}

function validateMenuBody(body, allowedFields, requiredFields = []) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw errorHttp(400, 'Body harus berupa object JSON');
    }

    const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
    if (unknownFields.length) {
        throw errorHttp(400, `Field tidak dikenal: ${unknownFields.join(', ')}`);
    }
    const missingFields = requiredFields.filter((field) => body[field] === undefined);
    if (missingFields.length) {
        throw errorHttp(400, `Field wajib diisi: ${missingFields.join(', ')}`);
    }

    if (body.nama !== undefined && (typeof body.nama !== 'string' || !body.nama.trim())) {
        throw errorHttp(400, 'nama wajib berupa string yang tidak kosong');
    }
    if (body.harga !== undefined && (typeof body.harga !== 'number' || !Number.isFinite(body.harga) || body.harga < 0)) {
        throw errorHttp(400, 'harga wajib berupa angka nol atau lebih');
    }
    for (const field of ['tersedia', 'pedas']) {
        if (body[field] !== undefined && typeof body[field] !== 'boolean') {
            throw errorHttp(400, `${field} wajib berupa boolean`);
        }
    }
    if (body.variasi !== undefined) {
        if (!Array.isArray(body.variasi) || body.variasi.some((variation) =>
            !variation || typeof variation !== 'object' || Array.isArray(variation) ||
            typeof variation.nama !== 'string' || !variation.nama.trim() ||
            (variation.hargaTambahan !== undefined &&
                (typeof variation.hargaTambahan !== 'number' ||
                    !Number.isFinite(variation.hargaTambahan) || variation.hargaTambahan < 0)) ||
            Object.keys(variation).some((field) => !['nama', 'hargaTambahan'].includes(field))
        )) {
            throw errorHttp(400, 'variasi harus berupa array object { nama, hargaTambahan? }');
        }
    }
    if (body.kategori !== undefined && (typeof body.kategori !== 'string' || !body.kategori.trim())) {
        throw errorHttp(400, 'kategori wajib berupa string yang tidak kosong');
    }
    if (body.kategoriId !== undefined && typeof body.kategoriId !== 'string') {
        throw errorHttp(400, 'kategoriId wajib berupa string ObjectId');
    }
}

exports.getCategories = async (req, res) => {
    res.json(await menuItemsModel.getCategories());
};

exports.getAll = async (req, res) => {
    const minHarga = parsePrice(req.query.minHarga, 'minHarga');
    const maxHarga = parsePrice(req.query.maxHarga, 'maxHarga');
    if (minHarga !== undefined && maxHarga !== undefined && minHarga > maxHarga) {
        throw errorHttp(400, 'minHarga tidak boleh lebih besar dari maxHarga');
    }

    const fields = req.query.fields === undefined
        ? undefined
        : String(req.query.fields).split(',').map((field) => field.trim());
    if (fields && fields.some((field) => !field)) {
        throw errorHttp(400, 'fields harus berisi nama field yang dipisahkan koma');
    }

    const result = await menuItemsModel.getAll({
        kategori: req.query.kategori === undefined ? undefined : String(req.query.kategori),
        tersedia: parseBooleanFilter(req.query.tersedia, 'tersedia'),
        pedas: parseBooleanFilter(req.query.pedas, 'pedas'),
        q: req.query.q === undefined ? undefined : String(req.query.q).trim(),
        minHarga,
        maxHarga,
    }, {
        page: angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER),
        limit: angkaAman(req.query.limit, 10, 1, 50),
        sort: req.query.sort === undefined ? 'id' : String(req.query.sort),
        fields,
    });

    res.json(result);
};

exports.getById = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw errorHttp(400, 'id harus berupa bilangan bulat');

    const data = await menuItemsModel.getById(id);
    if (!data) throw errorHttp(404, 'Data tidak ditemukan');
    res.json(data);
};

exports.create = async (req, res) => {
    validateMenuBody(req.body, CREATE_FIELDS, ['nama', 'harga', 'tersedia', 'pedas']);
    if (req.body.kategori === undefined && req.body.kategoriId === undefined) {
        throw errorHttp(400, 'Field kategori atau kategoriId wajib diisi');
    }

    const category = await menuItemsModel.resolveCategory(req.body);
    if (!category) throw errorHttp(400, 'Kategori tidak ditemukan atau kategoriId tidak cocok');

    const data = {
        nama: req.body.nama,
        kategori: category.nama,
        kategoriId: category._id,
        harga: req.body.harga,
        tersedia: req.body.tersedia,
        pedas: req.body.pedas,
    };
    if (req.body.variasi !== undefined) data.variasi = req.body.variasi;

    const baru = await menuItemsModel.create(data);
    res.status(201).json({
        status: 'success',
        message: 'Data menu berhasil ditambahkan',
        data: baru,
    });
};

exports.update = async (req, res) => {
    validateMenuBody(req.body, UPDATE_FIELDS);
    if (Object.keys(req.body).length === 0) throw errorHttp(400, 'Minimal satu field wajib diperbarui');

    const updates = { ...req.body };
    if (req.body.kategori !== undefined || req.body.kategoriId !== undefined) {
        const category = await menuItemsModel.resolveCategory(req.body);
        if (!category) throw errorHttp(400, 'Kategori tidak ditemukan atau kategoriId tidak cocok');
        updates.kategori = category.nama;
        updates.kategoriId = category._id;
    }

    const data = await menuItemsModel.update(Number(req.params.id), updates);
    if (!data) throw errorHttp(404, 'Data tidak ditemukan');
    res.json({
        status: 'success',
        message: 'Data menu berhasil diperbarui',
        data,
    });
};

exports.remove = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw errorHttp(400, 'id harus berupa bilangan bulat');

    const berhasil = await menuItemsModel.remove(id);
    if (!berhasil) throw errorHttp(404, 'Data tidak ditemukan');
    res.status(204).send();
};
