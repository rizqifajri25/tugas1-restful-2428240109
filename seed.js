require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const menuItemsModel = require('./models/menuItemsModel');
const Category = require('./models/categoryModel');

const categories = [
    { kode: 'MAKANAN', nama: 'Makanan' },
    { kode: 'MINUMAN', nama: 'Minuman' },
];
const menuItems = [
    { id: 1, nama: 'Nasi Goreng Kampung', kategori: 'Makanan', harga: 22000, tersedia: true, pedas: true, variasi: [{ nama: 'Telur ceplok', hargaTambahan: 5000 }] },
    { id: 2, nama: 'Mie Ayam Bakso', kategori: 'Makanan', harga: 18000, tersedia: true, pedas: false, variasi: [{ nama: 'Mie jumbo', hargaTambahan: 5000 }] },
    { id: 3, nama: 'Sate Ayam', kategori: 'Makanan', harga: 25000, tersedia: true, pedas: false },
    { id: 4, nama: 'Ayam Geprek', kategori: 'Makanan', harga: 20000, tersedia: true, pedas: true, variasi: [{ nama: 'Nasi tambahan', hargaTambahan: 5000 }] },
    { id: 5, nama: 'Soto Ayam', kategori: 'Makanan', harga: 18000, tersedia: true, pedas: false },
    { id: 6, nama: 'Rendang Sapi', kategori: 'Makanan', harga: 32000, tersedia: true, pedas: true },
    { id: 7, nama: 'Gado-Gado', kategori: 'Makanan', harga: 17000, tersedia: true, pedas: false },
    { id: 8, nama: 'Bakso Urat', kategori: 'Makanan', harga: 20000, tersedia: true, pedas: false, variasi: [{ nama: 'Bakso ekstra', hargaTambahan: 6000 }] },
    { id: 9, nama: 'Nasi Uduk Komplit', kategori: 'Makanan', harga: 23000, tersedia: true, pedas: false },
    { id: 10, nama: 'Ikan Bakar', kategori: 'Makanan', harga: 30000, tersedia: false, pedas: true },
    { id: 11, nama: 'Kentang Goreng', kategori: 'Makanan', harga: 12000, tersedia: true, pedas: false },
    { id: 12, nama: 'Pisang Goreng', kategori: 'Makanan', harga: 12000, tersedia: true, pedas: false },
    { id: 13, nama: 'Es Teh Manis', kategori: 'Minuman', harga: 5000, tersedia: true, pedas: false, variasi: [{ nama: 'Gelas besar', hargaTambahan: 3000 }] },
    { id: 14, nama: 'Es Jeruk', kategori: 'Minuman', harga: 8000, tersedia: true, pedas: false, variasi: [{ nama: 'Jeruk hangat', hargaTambahan: 0 }] },
    { id: 15, nama: 'Kopi Susu', kategori: 'Minuman', harga: 15000, tersedia: true, pedas: false, variasi: [{ nama: 'Es', hargaTambahan: 0 }, { nama: 'Extra shot', hargaTambahan: 5000 }] },
    { id: 16, nama: 'Jus Alpukat', kategori: 'Minuman', harga: 16000, tersedia: true, pedas: false },
    { id: 17, nama: 'Air Mineral', kategori: 'Minuman', harga: 5000, tersedia: true, pedas: false },
    { id: 18, nama: 'Cappuccino', kategori: 'Minuman', harga: 18000, tersedia: false, pedas: false },
    { id: 19, nama: 'Es Cendol', kategori: 'Minuman', harga: 10000, tersedia: true, pedas: false },
    { id: 20, nama: 'Susu Cokelat', kategori: 'Minuman', harga: 12000, tersedia: true, pedas: false },
];

async function main() {
    if (!process.env.DB_URI) {
        throw new Error('DB_URI belum diatur pada file .env');
    }

    await mongoose.connect(process.env.DB_URI);
    try {
        await Category.deleteMany({});
        const insertedCategories = await Category.insertMany(categories);
        const categoryByName = new Map(insertedCategories.map((category) => [category.nama, category._id]));
        const itemsWithReferences = menuItems.map((item) => ({
            ...item,
            kategoriId: categoryByName.get(item.kategori),
        }));
        await menuItemsModel.replaceAll(itemsWithReferences);
        console.log(`Seed selesai: ${insertedCategories.length} kategori dan ${menuItems.length} menu tersimpan`);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error('Gagal membuat seed menu restoran:', error.message);
    process.exitCode = 1;
});
