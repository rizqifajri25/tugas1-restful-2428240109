let menuItems = [
    { id: 1, nama: 'Es Teh Manis', kategori: 'Minuman', harga: 5000, tersedia: true, pedas: false },
    { id: 2, nama: 'Brown Sugar Boba', kategori: 'Minuman', harga: 10000, tersedia: true, pedas: false },
    { id: 3, nama: 'Croissant', kategori: 'Makanan', harga: 15000, tersedia: false, pedas: false },
    { id: 4, nama: 'Kentang Goreng', kategori: 'Makanan', harga: 10000, tersedia: true, pedas: false },
    { id: 5, nama: 'Mie Ayam Pedas', kategori: 'Makanan', harga: 15000, tersedia: true, pedas: true }
];

let nextId = 6;

function getAll(filters) {
    const { kategori, tersedia, pedas } = filters;

    return menuItems.filter((item) =>
        (kategori === undefined || item.kategori === kategori) &&
        (tersedia === undefined || String(item.tersedia) === tersedia) &&
        (pedas === undefined || String(item.pedas) === pedas)
    );

}

function getById(id) {
    return menuItems.find((item) => item.id === id);
}

function create(data) {
    const baru = { id: nextId++, ...data };
    menuItems.push(baru);
    return baru;
}

function update(id, data) {
    const index = menuItems.findIndex((item) => item.id === id);
    if (index === -1) return null;

    menuItems[index] = { ...menuItems[index], ...data, id };
    return menuItems[index];
}

function remove(id) {
    const index = menuItems.findIndex((item) => item.id === id);
    if (index === -1) return false;

    menuItems.splice(index, 1);
    return true;
}

module.exports = { getAll, getById, create, update, remove };
