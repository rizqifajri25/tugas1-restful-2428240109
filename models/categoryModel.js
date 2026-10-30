const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    kode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    nama: { type: String, required: true, unique: true, trim: true },
}, {
    collection: 'menuCategories',
    versionKey: false,
});

module.exports = mongoose.model('MenuCategory', categorySchema);
