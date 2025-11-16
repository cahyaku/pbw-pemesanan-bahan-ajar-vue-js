/**
 * Aplikasi Vue.js untuk Manajemen Stok Bahan Ajar
 * Menggunakan Vue 2.x untuk mengelola data stok bahan ajar
 */

// Inisialisasi Vue setelah DOM selesai dimuat
document.addEventListener('DOMContentLoaded', function () {
    // Periksa apakah pengguna sudah login
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Inisialisasi Vue App
    initializeVueApp();
});

/**
 * Fungsi untuk menginisialisasi Aplikasi Vue
 */
function initializeVueApp() {
    // 1. formatnya dengan new Vue({ ... })
    // di dalamnya ada el, data, computed, methods, mounted, dll.
    new Vue({
        // 2. elemen ini untuk menentukan elemen HTML mana yang akan dikendalikan oleh Vue
        el: '#app',
        // 3. data berisi semua veriabel yang akan digunakan di dalam aplikasi.
        data: {
            // Data dari dataBahanAjar.js
            upbjjList: [],
            kategoriList: [],
            stok: [],

            // Informasi pengguna
            userName: 'User',

            // Properti filter (two-way data binding dengan v-model)
            searchQuery: '',
            filterKategori: '',
            filterUpbjj: '',
            sortBy: '',

            // Data form untuk tambah/edit
            formData: {
                kode: '',
                judul: '',
                kategori: '',
                upbjj: '',
                lokasiRak: '',
                harga: 0,
                qty: 0,
                safety: 0,
                catatanHTML: ''
            },

            // Status modal
            editMode: false,
            editIndex: -1,

            // Instance modal Bootstrap
            modalInstance: null,

            // Sistem alert
            alert: {
                show: false,
                type: '',
                title: '',
                message: '',
                icon: '',
                timeout: null
            },

            // Alert form untuk error/warning di dalam modal
            formAlert: {
                show: false,
                type: '',
                title: '',
                message: '',
                icon: ''
            },

            // Alert sukses untuk ditampilkan di tengah layar
            successAlert: {
                show: false,
                title: '',
                message: ''
            }
        },

        // 4. computed properties yang berisi perhitungan data berdasarkan data lain.
        // Pada kasus ini, untuk memfilter stok berdasarkan kriteria pencarian dan melakukan variasi pengurutan.
        computed: {
            /**
             * Filter stok berdasarkan kata kunci pencarian, kategori, dan upbjj
             * Menggunakan computed property untuk optimasi performa
             */
            filteredStok() {
                let result = this.stok;

                // Filter berdasarkan kata kunci pencarian (kode atau judul)
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

                // Pengurutan berdasarkan pilihan
                if (this.sortBy) {
                    const [field, order] = this.sortBy.split('-');

                    result = [...result].sort((a, b) => {
                        let valueA, valueB;

                        if (field === 'judul') {
                            valueA = a.judul.toLowerCase();
                            valueB = b.judul.toLowerCase();

                            if (order === 'asc') {
                                return valueA.localeCompare(valueB);
                            } else {
                                return valueB.localeCompare(valueA);
                            }
                        } else if (field === 'qty' || field === 'harga') {
                            valueA = a[field];
                            valueB = b[field];

                            if (order === 'asc') {
                                return valueA - valueB;
                            } else {
                                return valueB - valueA;
                            }
                        }

                        return 0;
                    });
                }

                return result;
            },

            /**
             * Pesan peringatan ketika stok di bawah safety stock
             */
            stockWarning() {
                if (this.formData.qty > 0 && this.formData.safety > 0) {
                    if (this.formData.qty < this.formData.safety) {
                        return `Peringatan: Stok (${this.formData.qty}) di bawah safety stock (${this.formData.safety})!`;
                    }
                }
                return '';
            }
        },

        // Pengamat perubahan data (kosong karena computed properties menangani reaktivitas)

        // Metode-metode untuk berbagai operasi
        methods: {
            /**
             * Mendapatkan kelas CSS untuk warna stok
             * @param {number} qty - Jumlah stok
             * @returns {string} Kelas CSS
             */
            getStockClass(qty) {
                if (qty === 0) {
                    return 'text-danger';
                } else if (qty <= 10) {
                    return 'text-warning';
                } else {
                    return 'text-success';
                }
            },

            /**
             * Mendapatkan teks status berdasarkan stok dan safety stock
             * @param {Object} item - Item stok
             * @returns {string} Teks status
             */
            getStatusText(item) {
                if (item.qty === 0) {
                    return 'Habis';
                } else if (item.qty < item.safety) {
                    return 'Stok Rendah';
                } else {
                    return 'Tersedia';
                }
            },

            /**
             * Mendapatkan kelas badge untuk status
             * @param {Object} item - Item stok
             * @returns {string} Kelas badge
             */
            getStatusBadgeClass(item) {
                if (item.qty === 0) {
                    return 'bg-danger';
                } else if (item.qty < item.safety) {
                    return 'bg-warning text-dark';
                } else {
                    return 'bg-success';
                }
            },

            /**
             * RESET semua filter, jadi ini untuk mengosongkan nilai filter
             */
            resetFilters() {
                this.searchQuery = '';
                this.filterKategori = '';
                this.filterUpbjj = '';
                this.sortBy = '';
            },

            /**
             * Menampilkan modal untuk tambah stok baru
             */
            showAddStockModal() {
                this.editMode = false;
                this.editIndex = -1;
                this.resetFormData();
                this.openModal();
            },

            /**
             * Menampilkan modal untuk edit stok
             * @param {number} index - Indeks di filteredStok
             */
            editStock(index) {
                this.editMode = true;

                // Cari indeks asli di array stok
                const item = this.filteredStok[index];
                this.editIndex = this.stok.findIndex(s => s.kode === item.kode);

                // Isi form dengan data yang ada
                this.formData = { ...item };

                this.openModal();
            },

            /**
             * Method untuk menyimpan stok (tambah atau edit)
             * jadi ini yang akan dapapi dipanggil dari event handler 
             * seperti @click="saveStock" di tombol simpan pada modal.
             */
            saveStock() {
                try {
                    // Validasi form
                    if (!this.validateForm()) {
                        return;
                    }

                    if (this.editMode) {
                        // Update stok yang ada
                        this.$set(this.stok, this.editIndex, { ...this.formData });
                        
                        // Tutup modal terlebih dahulu
                        this.closeModal();
                        
                        // Tampilkan success alert di tengah layar
                        this.showSuccessAlert('Berhasil!', `Stok bahan ajar ${this.formData.kode} berhasil diupdate.`);
                    } else {
                        // Cek duplikasi kode
                        const exists = this.stok.some(item => item.kode === this.formData.kode);
                        if (exists) {
                            this.showFormAlert('warning', 'Kode Sudah Ada!', 'Kode mata kuliah sudah ada dalam sistem!');
                            return;
                        }

                        // Tambah stok baru
                        // Karena this.stok merujuk ke dataBahanAjarSource.stok,
                        // push ke this.stok otomatis update dataBahanAjarSource juga
                        this.stok.push({ ...this.formData });

                        // Tutup modal terlebih dahulu
                        this.closeModal();
                        
                        // Tampilkan success alert di tengah layar
                        this.showSuccessAlert('Berhasil!', `Stok bahan ajar ${this.formData.kode} berhasil ditambahkan ke sistem.`);
                    }

                } catch (error) {
                    this.showFormAlert('danger', 'Gagal Menyimpan!', 'Terjadi kesalahan saat menyimpan data stok. Silakan coba lagi.');
                }
            },

            /**
             * Validasi form sebelum submit
             * @returns {boolean} True jika valid
             */
            validateForm() {
                // Sembunyikan form alert sebelum validasi
                this.hideFormAlert();

                if (!this.formData.kode || !this.formData.judul) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'Kode dan Nama Mata Kuliah harus diisi!');
                    return false;
                }

                if (!this.formData.kategori || !this.formData.upbjj) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'Kategori dan UT-Daerah harus dipilih!');
                    return false;
                }

                if (!this.formData.lokasiRak) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'Lokasi Rak harus diisi!');
                    return false;
                }

                if (this.formData.qty < 0 || this.formData.safety < 0) {
                    this.showFormAlert('warning', 'Nilai Tidak Valid!', 'Jumlah stok dan safety stock tidak boleh negatif!');
                    return false;
                }

                if (this.formData.harga <= 0) {
                    this.showFormAlert('warning', 'Harga Tidak Valid!', 'Harga harus lebih dari 0!');
                    return false;
                }

                // Validasi format kode mata kuliah (contoh: EKMA4116)
                if (!/^[A-Z]{4}\d{4}$/.test(this.formData.kode)) {
                    this.showFormAlert('warning', 'Format Salah!', 'Format kode mata kuliah harus: 4 huruf + 4 angka (contoh: EKMA4116)!');
                    return false;
                }

                return true;
            },

            /**
             * Reset data form ke nilai default
             */
            resetFormData() {
                this.formData = {
                    kode: '',
                    judul: '',
                    kategori: '',
                    upbjj: '',
                    lokasiRak: '',
                    harga: 0,
                    qty: 0,
                    safety: 0,
                    catatanHTML: ''
                };
            },

            /**
             * Membuka modal menggunakan Bootstrap
             */
            openModal() {
                const modalEl = document.getElementById('addStockModal');
                if (!this.modalInstance) {
                    this.modalInstance = new bootstrap.Modal(modalEl);
                }
                this.modalInstance.show();
            },

            /**
             * Menutup modal
             */
            closeModal() {
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                this.hideFormAlert(); // Sembunyikan form alert ketika modal ditutup
                this.resetFormData();
            },

            /**
             * Tampilkan pesan alert dengan konfigurasi ikon otomatis
             */
            showAlert(type, title, message, duration = 5000) {
                const iconMap = {
                    success: 'bi bi-check-circle-fill',
                    danger: 'bi bi-exclamation-triangle-fill',
                    warning: 'bi bi-exclamation-triangle-fill',
                    info: 'bi bi-info-circle-fill'
                };

                // Hapus timeout yang ada
                if (this.alert.timeout) clearTimeout(this.alert.timeout);

                // Atur data alert
                this.alert = {
                    show: true,
                    type: `alert-${type}`,
                    title,
                    message,
                    icon: iconMap[type] || iconMap.info,
                    timeout: setTimeout(() => this.hideAlert(), duration)
                };
            },

            /**
             * Sembunyikan pesan alert
             */
            hideAlert() {
                this.alert.show = false;
                if (this.alert.timeout) {
                    clearTimeout(this.alert.timeout);
                    this.alert.timeout = null;
                }
            },

            /**
             * Tampilkan alert form (untuk error/warning di dalam modal)
             */
            showFormAlert(type, title, message) {
                const iconMap = {
                    danger: 'bi bi-exclamation-triangle-fill',
                    warning: 'bi bi-exclamation-triangle-fill'
                };

                this.formAlert = {
                    show: true,
                    type: `alert-${type}`,
                    title,
                    message,
                    icon: iconMap[type] || 'bi bi-info-circle-fill'
                };
            },

            /**
             * Sembunyikan alert form
             */
            hideFormAlert() {
                this.formAlert.show = false;
            },

            /**
             * Tampilkan/sembunyikan alert sukses (untuk sukses di tengah layar)
             */
            showSuccessAlert(title, message) {
                this.successAlert = { show: true, title, message };
            },

            hideSuccessAlert() {
                this.successAlert.show = false;
            },

            /**
             * Fungsi keluar dari sistem
             */
            logout() {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            },

            /**
             * Muat data dari dataBahanAjar.js
             */
            loadDataFromSource() {
                // Ambil data dari variabel global yang didefinisikan di dataBahanAjar.js
                if (typeof dataBahanAjarSource !== 'undefined') {
                    this.upbjjList = dataBahanAjarSource.upbjjList || [];
                    this.kategoriList = dataBahanAjarSource.kategoriList || [];
                    this.stok = dataBahanAjarSource.stok || [];
                } else {
                    // Data kosong jika sumber data tidak tersedia
                    this.upbjjList = [];
                    this.kategoriList = [];
                    this.stok = [];
                }
            }
        },

        // Siklus hidup komponen
        mounted() {
            // Muat data saat komponen di-mount
            this.loadDataFromSource();

            // Muat informasi pengguna
            const user = getCurrentUser();
            if (user) {
                this.userName = user.nama;
            }
        }
    });
}