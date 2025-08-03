# Smarteschool - Materi
> **Versi Lengkap:** Akses private repository di: https://github.com/Fruzh/smarteschool-client-materi.git

![Preview Materi](https://i.imgur.com/r5GITZB.png)

## Struktur Project
```
smarteschool-client-smkn1cibinong
├── components
│   └── Shared
│       └── Skeleton
│           ├── CardKelasSkeleton.js
│           └── CardBabSkeleton.js
├── pages
│   └── smartschool
│       └── materi
│           ├── [id]
│           │   └── index.js
│           └── index.js
└── package.json
```

## Cara Kerja Sistem
Sistem materi ini bekerja dengan struktur hierarki: **Materi → Bab → Topik**

### Konsep Dasar:
- Setiap **materi** bisa memiliki multiple **bab**
- Setiap **bab** bisa memiliki multiple **topik**
- Setiap **topik** memiliki data waktu dibuat dan waktu selesai (dibaca)

### Fitur Progress Tracking:
- Ketika topik memiliki waktu selesai, topik tersebut masuk ke kategori "sudah dibaca"
- Progress bar dihitung berdasarkan perbandingan topik yang sudah dibaca vs total topik
- Di halaman `/materi`, data JSON dikumpulkan per ID materi untuk menghitung progress bar

### Perubahan Utama:
- **Sebelumnya**: `/materi` hanya menampilkan list materi
- **Sekarang**: `/materi` menampilkan materi lengkap dengan data bab dan topik + progress bar

### Fitur Filter & Sorting:

#### **Urutkan:** (Pilih salah satu)
- **Terbaru**: Berdasarkan topik yang baru ditambahkan
- **Terlama**: Berdasarkan topik terlama yang ditambahkan  
- **Terakhir Dikerjakan**: Berdasarkan topik yang terakhir dikerjakan

#### **Filter Tanggal:** (Opsional - bisa dikombinasikan dengan urutan apapun)
- **Dikerjakan pada**: Filter berdasarkan rentang tanggal tertentu

*Contoh: Bisa memilih "Terbaru" + "Dikerjakan pada 1-15 Januari" untuk melihat topik terbaru yang dikerjakan dalam rentang tanggal tersebut*

#### **Status:**
- **Semua**: Menampilkan materi belum dan sudah selesai
- **Belum Selesai**: Materi dengan progress bar dibawah 100%
- **Sudah Selesai**: Materi dengan progress bar sudah 100%

### Fitur Pencarian:
- **Di `/materi`**: Pencarian berdasarkan nama materi/mapel
- **Di `/materi/[id]`**: Pencarian berdasarkan nama bab dan topik

### Fitur Tanggal Terintegrasi:
Ketika filter "Dikerjakan pada" digunakan dengan rentang tanggal:
1. Di halaman `/materi/index.js` akan menampilkan topik mana yang dikerjakan pada tanggal tersebut
2. Ketika masuk ke materi tertentu, halaman akan otomatis menampilkan filter berdasarkan tanggal yang dipilih
3. Data filter tersimpan di **LocalStorage** sehingga konsisten antar halaman

### Fitur Tambahan:
- **Mobile responsive**: Dropdown khusus untuk layar mobile
- **LocalStorage**: Menyimpan pengaturan filter untuk konsistensi antar halaman

## Langkah-langkah Setup
### 1. Clone Repository Utama
```bash
git clone https://github.com/goent26/smarteschool-client-smkn1cibinong.git
```
### 2. Masuk ke Direktori Project
```bash
cd smarteschool-client-smkn1cibinong
```
### 3. Clone Repository Materi
Clone repository materi ke folder terpisah:
```bash
git clone https://github.com/Fruzh/smarteschool-materi.git
```
### 4. Replace File-file yang Diperlukan
Berdasarkan struktur project di atas, copy dan paste file-file dari repository `smarteschool-materi` ke dalam project `smarteschool-client-smkn1cibinong` pada path yang sesuai:
#### File yang perlu di-replace:
- `components/Shared/Skeleton/CardKelasSkeleton.js`
- `components/Shared/Skeleton/CardBabSkeleton.js`
- `pages/smartschool/materi/index.js`
- `pages/smartschool/materi/[id]/index.js`
- `package.json`
### 5. Install Dependencies
```bash
npm install
```
### 6. Konfigurasi API Endpoint
Sebelum menjalankan server, pastikan konfigurasi API endpoint sudah benar:
#### File: `client/ApiClient.js`
```javascript
const API_HOST = "http://localhost:[port backend]";
```
#### File: `client/clientAxios.js`
```javascript
export const baseURL = "http://localhost:[port backend]";
```
*Ganti *`[port backend]`* dengan port yang digunakan oleh backend*
### 7. Setup Backend dan Database
Pastikan:
- Backend server sudah berjalan
- Database sudah di-import dengan benar
- Konfigurasi koneksi database sudah sesuai
### 8. Jalankan Development Server
```bash
npm run dev
```
Website akan berjalan di: **http://localhost:2025** (sesuai konfigurasi di package.json)


