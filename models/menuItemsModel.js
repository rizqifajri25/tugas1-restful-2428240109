const mongoose = require('mongoose');
const Category = require('./categoryModel');

const variationSchema = new mongoose.Schema({
    nama: { type: String, required: true, trim: true },
    hargaTambahan: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nama: { type: String, required: true, trim: true },
    kategori: { type: String, required: true, trim: true },
    kategoriId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuCategory',
        required: true,
    },
    harga: { type: Number, required: true, min: 0 },
    tersedia: { type: Boolean, required: true },
    pedas: { type: Boolean, required: true },
    variasi: { type: [variationSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
}, {
    collection: 'tugas1',
    versionKey: false,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const FIELD_SORT = ['id', 'nama', 'kategori', 'harga', 'createdAt'];
const FIELD_SELECT = ['id', 'nama', 'kategori', 'kategoriId', 'harga', 'tersedia', 'pedas', 'variasi', 'createdAt'];

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function selectMenuFields(query, fields) {
    const projection = fields ? `${fields.join(' ')} -_id` : '-_id';
    const selectedQuery = query.select(projection);

    if (!fields || fields.includes('kategoriId')) {
        selectedQuery.populate('kategoriId', 'kode nama');
    }

    return selectedQuery;
}

async function getAll(filters = {}, options = {}) {
    const queryFilter = {};

    if (filters.kategori !== undefined) {
        const category = await Category.findOne({
            nama: new RegExp(`^${escapeRegex(filters.kategori)}$`, 'i'),
        }).select('_id').lean();
        queryFilter.kategoriId = category ? category._id : { $in: [] };
    }
    if (filters.tersedia !== undefined) queryFilter.tersedia = filters.tersedia;
    if (filters.pedas !== undefined) queryFilter.pedas = filters.pedas;
    if (filters.q) queryFilter.nama = new RegExp(escapeRegex(filters.q), 'i');
    if (filters.minHarga !== undefined || filters.maxHarga !== undefined) {
        queryFilter.harga = {};
        if (filters.minHarga !== undefined) queryFilter.harga.$gte = filters.minHarga;
        if (filters.maxHarga !== undefined) queryFilter.harga.$lte = filters.maxHarga;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const sort = options.sort || 'id';
    const descending = sort.startsWith('-');
    const sortField = descending ? sort.slice(1) : sort;

    if (!FIELD_SORT.includes(sortField)) {
        const error = new Error(`sort hanya boleh: ${FIELD_SORT.join(', ')}`);
        error.status = 400;
        throw error;
    }
    if (options.fields && !options.fields.every((field) => FIELD_SELECT.includes(field))) {
        const error = new Error(`fields hanya boleh: ${FIELD_SELECT.join(', ')}`);
        error.status = 400;
        throw error;
    }

    const findQuery = selectMenuFields(MenuItem.find(queryFilter), options.fields)
        .sort({ [sortField]: descending ? -1 : 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const [data, total] = await Promise.all([
        findQuery.lean(),
        MenuItem.countDocuments(queryFilter),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
}

async function getById(id) {
    if (!Number.isInteger(id)) return null;

    return selectMenuFields(MenuItem.findOne({ id })).lean();
}

async function getCategories() {
    return Category.find().select('kode nama').sort({ nama: 1 }).lean();
}

async function resolveCategory({ kategori, kategoriId }) {
    let category;
    if (kategoriId !== undefined) {
        if (!mongoose.isValidObjectId(kategoriId)) return null;
        category = await Category.findById(kategoriId);
        if (category && kategori !== undefined &&
            category.nama.toLowerCase() !== kategori.trim().toLowerCase()) {
            return null;
        }
    } else if (typeof kategori === 'string') {
        category = await Category.findOne({
            nama: new RegExp(`^${escapeRegex(kategori.trim())}$`, 'i'),
        });
    }

    return category || null;
}

async function create(data) {
    const latestMenuItem = await MenuItem.findOne().sort({ id: -1 }).select('id -_id').lean();
    const menuItem = new MenuItem({ id: (latestMenuItem?.id ?? 0) + 1, ...data });
    await menuItem.save();
    return selectMenuFields(MenuItem.findOne({ id: menuItem.id })).lean();
}

async function update(id, data) {
    if (!Number.isInteger(id)) return null;

    const updates = { ...data };
    delete updates.id;

    return selectMenuFields(
        MenuItem.findOneAndUpdate({ id }, updates, { returnDocument: 'after', runValidators: true })
    ).lean();
}

async function remove(id) {
    if (!Number.isInteger(id)) return false;

    const result = await MenuItem.deleteOne({ id });
    return result.deletedCount > 0;
}

async function replaceAll(items) {
    await MenuItem.deleteMany({});
    return MenuItem.insertMany(items);
}

module.exports = {
    getAll,
    getById,
    getCategories,
    resolveCategory,
    create,
    update,
    remove,
    replaceAll,
};
