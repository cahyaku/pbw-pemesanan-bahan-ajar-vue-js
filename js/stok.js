/**
 * Inisiasi halaman saat event DOM selesai dimuat (atau DOMContentLoaded)
 */
document.addEventListener('DOMContentLoaded', function () {
    // Periksa apakah pengguna sudah login
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Muat informasi pengguna di navbar
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.nama;
    }

    loadStockData();
});

/**
 * Memuat dan menampilkan data stok bahan ajar ke dalam tabel
 * Mengiterasi semua data bahan ajar dan membuat baris tabel
 */
function loadStockData() {
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = '';

    dataBahanAjar.forEach((item, index) => {
        const row = createStockRow(item, index + 1);
        tableBody.appendChild(row);
    });
}

/**
 * Membuat baris tabel untuk satu item stok bahan ajar
 * @param {Object} stockData - Data stok bahan ajar
 * @param {number} number - Nomor urut dalam tabel
 * @returns {HTMLTableRowElement} Elemen baris tabel
 */
function createStockRow(stockData, number) {
    const row = document.createElement('tr');

    // Tentukan status stok
    const stockStatus = getStockStatus(stockData.stok);

    // Periksa apakah harus menampilkan gambar cover atau "-"
    const showCoverImage = stockData.cover &&
        stockData.cover !== "img/default_cover.svg" &&
        stockData.cover.trim() !== "";

    const coverColumn = showCoverImage
        ? `<img src="${stockData.cover}" alt="${stockData.namaBarang}" 
             class="book-cover" 
             onerror="this.src='img/default_cover.svg';">`
        : `<div class="cover-placeholder">-</div>`;

    row.innerHTML = `
        <td>${number}</td>
        <td class="text-center">
            ${coverColumn}
        </td>
        <td><span class="badge bg-info">${stockData.kodeLokasi}</span></td>
        <td><span class="badge bg-secondary">${stockData.kodeBarang}</span></td>
        <td>${stockData.namaBarang}</td>
        <td>${stockData.jenisBarang}</td>
        <td class="text-center">${stockData.edisi}</td>
        <td class="text-center">
            <span class="fw-bold ${getStockClass(stockData.stok)}">${stockData.stok}</span>
        </td>
        <td>
            <span class="badge ${stockStatus.class}">${stockStatus.text}</span>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editStock(${number - 1})" title="Edit">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteStock(${number - 1})" title="Hapus">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    return row;
}

/**
 * Mendapatkan status stok berdasarkan jumlah
 * @param {number} stok - Jumlah stok
 * @returns {Object} Objek berisi teks dan kelas CSS untuk status
 */
function getStockStatus(stok) {
    if (stok === 0) {
        return { text: 'Habis', class: 'bg-danger' };
    } else if (stok <= 50) {
        return { text: 'Stok Rendah', class: 'bg-warning' };
    } else if (stok <= 200) {
        return { text: 'Tersedia', class: 'bg-success' };
    } else {
        return { text: 'Stok Tinggi', class: 'bg-primary' };
    }
}

/**
 * Mendapatkan kelas CSS untuk warna teks berdasarkan jumlah stok
 * @param {number} stok - Jumlah stok
 * @returns {string} Kelas CSS Bootstrap untuk warna teks
 */
function getStockClass(stok) {
    if (stok === 0) {
        return 'text-danger';
    } else if (stok <= 50) {
        return 'text-warning';
    } else {
        return 'text-success';
    }
}

/**
 * Menampilkan modal untuk menambah stok baru
 */
function showAddStockModal() {
    const modal = new bootstrap.Modal(document.getElementById('addStockModal'));
    document.getElementById('addStockForm').reset();
    modal.show();
}

/**
 * Menambahkan stok bahan ajar baru ke dalam sistem
 * Validasi form dan menambahkan data ke array dataBahanAjar
 */
function addNewStock() {
    const form = document.getElementById('addStockForm');

    // Validasi form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Ambil data dari form
    const newStock = {
        kodeLokasi: document.getElementById('kodeLokasi').value.trim(),
        kodeBarang: document.getElementById('kodeBarang').value.trim(),
        namaBarang: document.getElementById('namaBarang').value.trim(),
        jenisBarang: document.getElementById('jenisBarang').value,
        edisi: document.getElementById('edisi').value,
        stok: parseInt(document.getElementById('stok').value)
        // Tidak ada properti cover - akan menampilkan placeholder "-"
    };

    // Periksa apakah kode barang sudah ada
    const existingItem = dataBahanAjar.find(item => item.kodeBarang === newStock.kodeBarang);
    if (existingItem) {
        showAlert('Kode barang sudah ada dalam sistem!', 'warning');
        return;
    }

    // Tambahkan ke array data
    dataBahanAjar.push(newStock);

    // Muat ulang tabel
    loadStockData();

    // Tutup modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addStockModal'));
    modal.hide();

    // Tampilkan pesan sukses
    showAlert('Stok bahan ajar berhasil ditambahkan!', 'success');
}

/**
 * Menampilkan modal edit stok dengan data yang sudah ada
 * @param {number} index - Index item dalam array dataBahanAjar
 */
function editStock(index) {
    const stockData = dataBahanAjar[index];

    // Isi form dengan data yang ada
    document.getElementById('kodeLokasi').value = stockData.kodeLokasi;
    document.getElementById('kodeBarang').value = stockData.kodeBarang;
    document.getElementById('namaBarang').value = stockData.namaBarang;
    document.getElementById('jenisBarang').value = stockData.jenisBarang;
    document.getElementById('edisi').value = stockData.edisi;
    document.getElementById('stok').value = stockData.stok;

    // Tampilkan modal
    const modal = new bootstrap.Modal(document.getElementById('addStockModal'));
    document.getElementById('addStockModalLabel').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Stok Bahan Ajar';

    // Ubah fungsi tombol sementara
    const addButton = document.querySelector('#addStockModal .btn-primary');
    addButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>Update Stok';
    addButton.onclick = function () { updateStock(index); };

    modal.show();
}

/**
 * Memperbarui data stok bahan ajar yang sudah ada
 * @param {number} index - Index item dalam array dataBahanAjar
 */
function updateStock(index) {
    const form = document.getElementById('addStockForm');

    // Validasi form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Ambil data dari form
    const updatedStock = {
        kodeLokasi: document.getElementById('kodeLokasi').value.trim(),
        kodeBarang: document.getElementById('kodeBarang').value.trim(),
        namaBarang: document.getElementById('namaBarang').value.trim(),
        jenisBarang: document.getElementById('jenisBarang').value,
        edisi: document.getElementById('edisi').value,
        stok: parseInt(document.getElementById('stok').value),
        cover: dataBahanAjar[index].cover // Pertahankan cover yang ada
    };

    // Periksa apakah kode barang konflik dengan item lain
    const existingItem = dataBahanAjar.find((item, i) => i !== index && item.kodeBarang === updatedStock.kodeBarang);
    if (existingItem) {
        showAlert('Kode barang sudah ada dalam sistem!', 'warning');
        return;
    }

    // Perbarui data
    dataBahanAjar[index] = updatedStock;

    // Muat ulang tabel
    loadStockData();

    // Tutup modal dan reset
    const modal = bootstrap.Modal.getInstance(document.getElementById('addStockModal'));
    modal.hide();
    resetModalToAdd();

    // Tampilkan pesan sukses
    showAlert('Stok bahan ajar berhasil diupdate!', 'success');
}

/**
 * Menghapus stok bahan ajar dari sistem setelah konfirmasi
 * @param {number} index - Index item dalam array dataBahanAjar yang akan dihapus
 */
function deleteStock(index) {
    const stockData = dataBahanAjar[index];

    if (confirm(`Apakah Anda yakin ingin menghapus stok "${stockData.namaBarang}"?`)) {
        // Hapus dari array
        dataBahanAjar.splice(index, 1);

        // Muat ulang tabel
        loadStockData();

        // Tampilkan pesan sukses
        showAlert('Stok bahan ajar berhasil dihapus!', 'success');
    }
}

/**
 * Mereset modal ke mode tambah stok baru
 * Mengubah label modal dan button handler ke fungsi addNewStock
 */
function resetModalToAdd() {
    document.getElementById('addStockModalLabel').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Tambah Stok Bahan Ajar Baru';
    const addButton = document.querySelector('#addStockModal .btn-primary');
    addButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>Tambah Stok';
    addButton.onclick = addNewStock;
}

// Reset modal ketika modal ditutup
document.getElementById('addStockModal').addEventListener('hidden.bs.modal', function () {
    resetModalToAdd();
});