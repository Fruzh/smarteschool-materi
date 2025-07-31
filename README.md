# Tutorial Setup Smarteschool - Materi
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

*Ganti `[port backend]` dengan port yang digunakan oleh backend*

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
