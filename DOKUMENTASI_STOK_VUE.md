# Dokumentasi Implementasi Vue.js pada Halaman Stok Bahan Ajar

## Ringkasan Implementasi

File `stok.js` dan `stok.html` telah diupdate untuk menggunakan Vue.js 2.x dengan mengambil data dari `dataBahanAjar.js`. Implementasi ini memenuhi semua kriteria yang diminta.

---

## 1. Mustaches/Directive v-text untuk Output Data

### Implementasi:
```html
<!-- Menggunakan v-text -->
<span v-text="userName">User</span>

<!-- Menggunakan mustaches {{ }} -->
<span class="badge bg-light text-dark ms-2">{{ filteredStok.length }} item</span>

<!-- Di dalam tabel -->
<td>{{ index + 1 }}</td>
<td>{{ item.judul }}</td>
<td>{{ item.upbjj }}</td>
```

**Penjelasan:**
- `v-text="userName"` menampilkan nama user dari data Vue
- Mustaches `{{ }}` digunakan untuk menampilkan data reaktif seperti jumlah item, index, judul mata kuliah, dll.
- Data diambil dari computed property `filteredStok` dan properties lainnya

---

## 2. Conditional Rendering (v-if/v-else/v-show)

### Implementasi:

```html
<!-- v-if untuk menampilkan pesan kosong -->
<tr v-if="filteredStok.length === 0">
    <td colspan="11" class="text-center text-muted py-4">
        Tidak ada data stok bahan ajar yang ditemukan
    </td>
</tr>

<!-- v-else untuk menampilkan data -->
<tr v-else v-for="(item, index) in filteredStok" :key="item.kode">
    ...
</tr>

<!-- v-if untuk icon dinamis -->
<i :class="editMode ? 'bi bi-pencil me-2' : 'bi bi-plus-circle me-2'"></i>

<!-- v-if untuk alert warning -->
<div v-if="stockWarning" class="alert alert-warning" role="alert">
    <i class="bi bi-exclamation-triangle me-2"></i>
    {{ stockWarning }}
</div>
```

**Penjelasan:**
- `v-if="filteredStok.length === 0"` mengecek apakah data kosong
- `v-else` menampilkan tabel jika ada data
- Conditional class binding dengan ternary operator untuk icon dinamis
- `v-if="stockWarning"` menampilkan warning hanya jika ada peringatan stok

---

## 3. Data Binding (v-bind & v-model)

### A. One-Way Data Binding (v-bind)

```html
<!-- v-bind untuk class dinamis -->
<span class="fw-bold" :class="getStockClass(item.qty)">{{ item.qty }}</span>
<span class="badge" :class="getStatusBadgeClass(item)">{{ getStatusText(item) }}</span>

<!-- v-bind untuk attributes -->
<option v-for="kategori in kategoriList" :key="kategori" :value="kategori">
    {{ kategori }}
</option>
```

### B. Two-Way Data Binding (v-model)

```html
<!-- Filter search -->
<input type="text" class="form-control" v-model="searchQuery" 
    placeholder="Cari kode atau nama mata kuliah...">

<!-- Filter dropdown -->
<select class="form-select" v-model="filterKategori">
    <option value="">Semua Kategori</option>
    <option v-for="kategori in kategoriList" :key="kategori" :value="kategori">
        {{ kategori }}
    </option>
</select>

<!-- Form input dengan modifier -->
<input type="text" class="form-control" v-model.trim="formData.kode">
<input type="number" class="form-control" v-model.number="formData.qty">
```

**Penjelasan:**
- `v-bind` (atau `:`) untuk binding class/attribute secara one-way
- `v-model` untuk two-way binding pada form inputs
- `v-model.trim` menghapus whitespace di awal dan akhir
- `v-model.number` mengkonversi input ke number

---

## 4. Computed Properties

### Implementasi:

```javascript
computed: {
    // Filter data stok secara reaktif
    filteredStok() {
        let result = this.stok;
        
        // Filter berdasarkan search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(item => 
                item.kode.toLowerCase().includes(query) ||
                item.judul.toLowerCase().includes(query)
            );
        }
        
        // Filter berdasarkan kategori
        if (this.filterKategori) {
            result = result.filter(item => item.kategori === this.filterKategori);
        }
        
        // Filter berdasarkan UPBJJ
        if (this.filterUpbjj) {
            result = result.filter(item => item.upbjj === this.filterUpbjj);
        }
        
        return result;
    },
    
    // Warning untuk stok rendah
    stockWarning() {
        if (this.formData.qty > 0 && this.formData.safety > 0) {
            if (this.formData.qty < this.formData.safety) {
                return `Peringatan: Stok (${this.formData.qty}) di bawah safety stock (${this.formData.safety})!`;
            }
        }
        return '';
    }
}
```

**Penjelasan:**
- `filteredStok` adalah computed property yang memfilter data berdasarkan search dan filter
- Computed property di-cache dan hanya di-recalculate saat dependencies berubah
- `stockWarning` memberikan peringatan dinamis berdasarkan qty dan safety stock

---

## 5. Methods Property

### Implementasi:

```javascript
methods: {
    // Method untuk styling
    getStockClass(qty) {
        if (qty === 0) return 'text-danger';
        else if (qty <= 10) return 'text-warning';
        else return 'text-success';
    },
    
    getStatusText(item) {
        if (item.qty === 0) return 'Habis';
        else if (item.qty < item.safety) return 'Stok Rendah';
        else return 'Tersedia';
    },
    
    getStatusBadgeClass(item) {
        if (item.qty === 0) return 'bg-danger';
        else if (item.qty < item.safety) return 'bg-warning text-dark';
        else return 'bg-success';
    },
    
    // Method untuk operasi CRUD
    showAddStockModal() { ... },
    editStock(index) { ... },
    saveStock() { ... },
    validateForm() { ... },
    resetFilters() { ... },
    
    // Method untuk load data
    loadDataFromSource() { ... }
}
```

**Penjelasan:**
- Methods digunakan untuk logic yang perlu dipanggil dari template atau methods lain
- Berbeda dengan computed, methods tidak di-cache dan selalu di-execute saat dipanggil
- Digunakan untuk event handling, CRUD operations, dan utility functions

---

## 6. Watchers

### Implementasi:

```javascript
watch: {
    // Watch search query
    searchQuery(newValue, oldValue) {
        if (newValue !== oldValue) {
            console.log(`Pencarian diubah dari "${oldValue}" ke "${newValue}"`);
            console.log(`Hasil pencarian: ${this.filteredStok.length} item`);
        }
    },
    
    // Watch filter kategori
    filterKategori(newValue, oldValue) {
        if (newValue !== oldValue) {
            console.log(`Filter kategori diubah: ${newValue || 'Semua'}`);
        }
    },
    
    // Watch filter UPBJJ
    filterUpbjj(newValue, oldValue) {
        if (newValue !== oldValue) {
            console.log(`Filter UPBJJ diubah: ${newValue || 'Semua'}`);
        }
    },
    
    // Deep watch untuk formData
    formData: {
        handler(newValue) {
            if (newValue.qty < newValue.safety && newValue.qty > 0) {
                console.warn('Stok di bawah safety stock!');
            }
        },
        deep: true
    }
}
```

**Penjelasan:**
- Watchers memantau perubahan pada data properties
- `searchQuery`, `filterKategori`, dan `filterUpbjj` watcher memberikan logging untuk debugging
- `formData` watcher menggunakan `deep: true` untuk memantau perubahan nested properties
- Watchers memberikan feedback real-time saat user berinteraksi dengan aplikasi

---

## Struktur Data dari dataBahanAjar.js

Data diambil dari file `dataBahanAjar.js` yang memiliki struktur:

```javascript
var app = new Vue ({
  el: '#app',
  data: {
      upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
      kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
      stok: [
        {
          kode: "EKMA4116",
          judul: "Pengantar Manajemen",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A3",
          harga: 65000,
          qty: 28,
          safety: 20,
          catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
        },
        // ... data lainnya
      ]
  }
});
```

---

## Fitur-Fitur yang Diimplementasikan

### 1. **Tampilan Data Stok**
- ✅ Kode Mata Kuliah (kode)
- ✅ Nama Mata Kuliah (judul)
- ✅ Kategori Mata Kuliah
- ✅ UT-Daerah (upbjj)
- ✅ Lokasi Rak
- ✅ Jumlah Stok (qty)
- ✅ Safety Stock
- ✅ Status (otomatis berdasarkan qty vs safety)
- ✅ Catatan (catatanHTML dengan HTML rendering)

### 2. **Filtering & Search**
- ✅ Search box untuk mencari berdasarkan kode atau nama MK
- ✅ Filter berdasarkan Kategori
- ✅ Filter berdasarkan UT-Daerah
- ✅ Tombol Reset untuk clear semua filter

### 3. **CRUD Operations**
- ✅ Tambah stok baru
- ✅ Edit stok existing
- ✅ Validasi form
- ✅ Warning otomatis untuk stok rendah

### 4. **UI/UX Enhancements**
- ✅ Badge dinamis untuk status stok
- ✅ Color coding untuk jumlah stok (merah/kuning/hijau)
- ✅ Counter jumlah item yang ditampilkan
- ✅ Modal form yang responsive
- ✅ Empty state ketika tidak ada data

---

## Cara Menjalankan

1. Pastikan file sudah disimpan dengan benar:
   - `stok.html`
   - `js/stok.js`
   - `js/dataBahanAjar.js`
   - `js/data.js`
   - `js/index.js`

2. Buka `stok.html` melalui XAMPP atau local server

3. Login terlebih dahulu (jika required)

4. Halaman stok akan menampilkan data dari `dataBahanAjar.js`

---

## Testing Checklist

- [x] Mustaches menampilkan data dengan benar
- [x] v-if/v-else bekerja untuk conditional rendering
- [x] v-model two-way binding berfungsi di form
- [x] v-bind untuk class dinamis berfungsi
- [x] Computed property memfilter data dengan benar
- [x] Methods dipanggil dengan benar dari template
- [x] Watchers memberikan logging saat data berubah
- [x] Form validation berfungsi
- [x] CRUD operations (Create, Read, Update) bekerja
- [x] Filter dan search bekerja dengan baik

---

## Kesimpulan

Implementasi Vue.js pada halaman Stok Bahan Ajar telah memenuhi **SEMUA kriteria** yang diminta:

1. ✅ **Mustaches/v-text** untuk output data
2. ✅ **v-if/v-else** untuk conditional rendering
3. ✅ **v-bind** untuk one-way binding & **v-model** untuk two-way binding
4. ✅ **Computed properties** untuk filtering data
5. ✅ **Methods properties** untuk operasi dan logic
6. ✅ **Watchers** untuk monitoring perubahan data

Aplikasi sekarang lebih reactive, maintainable, dan sesuai dengan best practices Vue.js!
