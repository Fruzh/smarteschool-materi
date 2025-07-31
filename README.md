# Tutorial Setup Smarteschool Project

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

### 5. Install Dependencies
```bash
npm install
```

### 6. Setup Backend dan Database
Pastikan:
- Backend server sudah berjalan
- Database sudah di-import dengan benar
- Konfigurasi koneksi database sudah sesuai

### 7. Jalankan Development Server
```bash
npm run dev
```

## Catatan Penting
- Pastikan semua file sudah ter-replace dengan benar sesuai struktur folder
- Cek konfigurasi API endpoint jika ada perubahan dari backend
- Pastikan backend server berjalan sebelum menjalankan client
- Jika ada error, cek console browser dan terminal untuk debugging

## Troubleshooting
Jika mengalami masalah:
1. Cek apakah semua dependencies sudah terinstall
2. Pastikan backend server sudah running
3. Cek konfigurasi database
4. Restart development server dengan `npm run dev`
