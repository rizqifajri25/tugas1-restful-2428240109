# Tugas1 RizqiFajri — Menu API

## Menjalankan aplikasi

1. Salin `.env.example` menjadi `.env`, lalu isi `API_KEY` yang hanya digunakan di lingkungan lokal.
2. Pastikan MongoDB berjalan pada `localhost:27017`.
3. Jalankan `npm install`, `npm run seed`, lalu `npm start`.

Seed mengisi ulang collection `tugas1` dengan 20 menu dan collection `menuCategories` dengan kategori. Kedua collection berada di database `tugas1`.

## Endpoint menu

Semua endpoint berada di `/menu-items`. `GET /menu-items/categories` mengembalikan kategori dan ObjectId yang dapat dipakai sebagai `kategoriId`.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/menu-items` | Daftar menu, filter, pagination, sorting, dan projection |
| GET | `/menu-items/:id` | Satu menu berdasarkan ID angka |
| POST | `/menu-items` | Membuat menu; wajib memakai header `x-api-key` |
| PUT | `/menu-items/:id` | Mengubah sebagian field menu; wajib memakai header `x-api-key` |
| DELETE | `/menu-items/:id` | Menghapus menu; wajib memakai header `x-api-key` |

### Query daftar

- Filter: `kategori`, `tersedia`, `pedas`, `q`, `minHarga`, dan `maxHarga`.
- Pagination: `page` (bawaan 1) dan `limit` (bawaan 10, maksimum 50).
- Sorting: `sort` memakai `id`, `nama`, `kategori`, `harga`, atau `createdAt`; awali dengan `-` untuk urutan menurun. Bawaan `id` naik.
- Projection: `fields` berisi nama field yang dipisahkan koma. Field yang tersedia: `id,nama,kategori,kategoriId,harga,tersedia,pedas,variasi,createdAt`.
- Respons daftar berbentuk `{ data, page, limit, total, totalPages }`.

Contoh:

```text
GET /menu-items?kategori=Makanan&pedas=true&page=1&limit=5&sort=-harga&fields=id,nama,harga,kategoriId,variasi
GET /menu-items?q=ayam&minHarga=10000&maxHarga=30000
```

### Embedding dan referencing

`variasi` disimpan embedded di dalam dokumen menu, misalnya:

```json
{
  "nama": "Es Teh Manis",
  "variasi": [
    { "nama": "Gelas besar", "hargaTambahan": 3000 }
  ]
}
```

Kategori disimpan terpisah di collection `menuCategories` dan direferensikan melalui `kategoriId`. Untuk membuat menu, kirim `kategori` (`"Makanan"`/`"Minuman"`) atau ObjectId `kategoriId` dari endpoint kategori. Field `kategori` tetap disertakan pada dokumen menu agar kompatibel dengan request API sebelumnya.
