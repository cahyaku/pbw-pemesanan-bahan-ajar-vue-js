# Test Login Flow - SITTA

## Langkah-langkah Testing

### 1. Test Login
1. Buka `index.html` di browser
2. Login dengan kredensial test:
   - Email: `admin@ut.ac.id`
   - Password: `admin123`
3. Klik tombol Login
4. Seharusnya redirect ke `dashboard.html`

### 2. Test Navigasi ke Stok
1. Di halaman Dashboard, klik menu "Informasi Bahan Ajar"
2. Seharusnya redirect ke `stok.html`
3. Halaman stok seharusnya menampilkan:
   - Tabel dengan 4 data stok
   - Filter search dan dropdown
   - Tombol "Tambah Stok Baru"

### 3. Debugging
Jika halaman stok tidak muncul:
1. Buka Developer Console (F12)
2. Periksa tab Console untuk error atau log:
   - `=== Stok Page Initialization ===`
   - `Checking if isLoggedIn function exists: function`
   - `User is logged in, initializing Vue app...`
   - `Loading data from dataBahanAjar.js...`
   - `Data loaded successfully`
   - `Vue App initialized successfully`

### 4. Troubleshooting

#### Error: "isLoggedIn is not defined"
- Pastikan `js/index.js` dimuat sebelum `js/stok.js`
- Cek urutan script di `stok.html`

#### Error: "dataBahanAjarSource is not defined"
- Pastikan `js/dataBahanAjar.js` dimuat
- Cek file dataBahanAjar.js menggunakan `dataBahanAjarSource` bukan `app`

#### Halaman redirect kembali ke login
- Cek apakah data tersimpan di sessionStorage dengan:
  ```javascript
  sessionStorage.getItem('currentUser')
  ```
- Pastikan logout menggunakan `sessionStorage.removeItem()` bukan `localStorage`

## Perubahan yang Dilakukan

### 1. `dataBahanAjar.js`
- ✅ Diubah dari Vue instance menjadi plain JavaScript object
- ✅ Nama variabel: `dataBahanAjarSource`
- ✅ Tidak ada konflik dengan Vue instance di stok.html

### 2. `stok.js`
- ✅ Logout menggunakan `sessionStorage` (bukan localStorage)
- ✅ Load data dari `dataBahanAjarSource`
- ✅ Tambah logging untuk debugging
- ✅ Check ketersediaan fungsi `isLoggedIn()`

### 3. `stok.html`
- ✅ Urutan script sudah benar:
  1. Bootstrap
  2. Vue.js CDN
  3. data.js
  4. dataBahanAjar.js
  5. index.js (fungsi auth)
  6. stok.js (Vue app)

## Expected Behavior

### Login Flow
```
index.html (login) 
  → sessionStorage.setItem('currentUser', userData)
  → redirect to dashboard.html
```

### Navigation to Stok
```
dashboard.html (click menu)
  → navigateTo('info-bahan-ajar')
  → window.location.href = 'stok.html'
  → stok.html loads
  → check isLoggedIn() (read sessionStorage)
  → if logged in: initialize Vue app
  → if not logged in: redirect to index.html
```

## Data Credentials untuk Testing

```javascript
// Admin
Email: admin@ut.ac.id
Password: admin123

// UPBJJ Jakarta
Email: rina@ut.ac.id
Password: rina123

// UPBJJ Makassar
Email: agus@ut.ac.id
Password: agus123

// Puslaba
Email: siti@ut.ac.id
Password: siti123

// Fakultas FISIP
Email: doni@ut.ac.id
Password: doni123
```
