/**
 * Vue.js Application for Stok Bahan Ajar Management
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
});/**
 * Fungsi untuk menginisialisasi Vue Application
 */
function initializeVueApp() {
    new Vue({
        el: '#app',
        data: {
            // Data dari dataBahanAjar.js
            upbjjList: [],
            kategoriList: [],
            stok: [],

            // User information
            userName: 'User',

            // Filter properties (two-way data binding dengan v-model)
            searchQuery: '',
            filterKategori: '',
            filterUpbjj: '',
            sortBy: '',

            // Form data untuk tambah/edit
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

            // Modal state
            editMode: false,
            editIndex: -1,

            // Bootstrap modal instance
            modalInstance: null,

            // Alert system
            alert: {
                show: false,
                type: '',
                title: '',
                message: '',
                icon: '',
                timeout: null
            },

            // Form alert untuk error/warning di dalam modal
            formAlert: {
                show: false,
                type: '',
                title: '',
                message: '',
                icon: ''
            },

            // Success alert untuk ditampilkan di tengah layar
            successAlert: {
                show: false,
                title: '',
                message: ''
            }
        },

        // Computed properties untuk filtering dan validasi
        computed: {
            /**
             * Filter stok berdasarkan search query, kategori, dan upbjj
             * Menggunakan computed property untuk optimasi performa
             */
            filteredStok() {
                let result = this.stok;

                // Filter berdasarkan search query (kode atau judul)
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

                // Sorting berdasarkan pilihan
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
             * Warning message ketika stok di bawah safety stock
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

        // Watchers untuk monitoring perubahan data
        watch: {
            /**
             * Watcher untuk searchQuery
             * Memberikan feedback saat user melakukan pencarian
             */
            searchQuery(newValue, oldValue) {
                // Filter akan otomatis dijalankan oleh computed property
            },

            /**
             * Watcher untuk filterKategori
             * Monitoring perubahan filter kategori
             */
            filterKategori(newValue, oldValue) {
                // Filter akan otomatis dijalankan oleh computed property
            },

            /**
             * Watcher untuk filterUpbjj
             * Monitoring perubahan filter UPBJJ
             */
            filterUpbjj(newValue, oldValue) {
                // Filter akan otomatis dijalankan oleh computed property
            },

            /**
             * Watcher untuk sortBy
             * Monitoring perubahan sorting
             */
            sortBy(newValue, oldValue) {
                // Sorting akan otomatis dijalankan oleh computed property
            },            /**
             * Deep watcher untuk formData
             * Monitoring semua perubahan dalam form
             */
            formData: {
                handler(newValue) {
                    // Validasi stok vs safety stock dilakukan di computed property
                },
                deep: true
            }
        },

        // Methods untuk berbagai operasi
        methods: {
            /**
             * Mendapatkan class CSS untuk warna stok
             * @param {number} qty - Jumlah stok
             * @returns {string} CSS class
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
             * Mendapatkan status text berdasarkan stok dan safety stock
             * @param {Object} item - Item stok
             * @returns {string} Status text
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
             * Mendapatkan class badge untuk status
             * @param {Object} item - Item stok
             * @returns {string} Badge class
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
             * Reset semua filter
             */
            resetFilters() {
                this.searchQuery = '';
                this.filterKategori = '';
                this.filterUpbjj = '';
                this.sortBy = '';
                this.showAlert('info', 'Reset Filter', 'Filter dan sorting telah direset');
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
             * @param {number} index - Index di filteredStok
             */
            editStock(index) {
                this.editMode = true;

                // Cari index asli di array stok
                const item = this.filteredStok[index];
                this.editIndex = this.stok.findIndex(s => s.kode === item.kode);

                // Populate form dengan data yang ada
                this.formData = { ...item };

                this.openModal();
            },

            /**
             * Menyimpan data stok (tambah atau edit)
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
                    console.error('Error saving stock:', error);
                    this.showFormAlert('danger', 'Gagal Menyimpan!', 'Terjadi kesalahan saat menyimpan data stok. Silakan coba lagi.');
                }
            },

            /**
             * Validasi form sebelum submit
             * @returns {boolean} True jika valid
             */
            validateForm() {
                // Hide form alert sebelum validasi
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
             * Reset form data ke nilai default
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
                this.hideFormAlert(); // Hide form alert ketika modal ditutup
                this.resetFormData();
            },

            /**
             * Show alert message
             */
            showAlert(type, title, message, duration = 5000) {
                // Clear existing timeout
                if (this.alert.timeout) {
                    clearTimeout(this.alert.timeout);
                }

                // Set alert data
                this.alert.show = true;
                this.alert.type = `alert-${type}`;
                this.alert.title = title;
                this.alert.message = message;

                // Set icon based on type
                switch (type) {
                    case 'success':
                        this.alert.icon = 'bi bi-check-circle-fill';
                        break;
                    case 'danger':
                        this.alert.icon = 'bi bi-exclamation-triangle-fill';
                        break;
                    case 'warning':
                        this.alert.icon = 'bi bi-exclamation-triangle-fill';
                        break;
                    case 'info':
                        this.alert.icon = 'bi bi-info-circle-fill';
                        break;
                    default:
                        this.alert.icon = 'bi bi-info-circle-fill';
                }

                // Auto hide after duration
                this.alert.timeout = setTimeout(() => {
                    this.hideAlert();
                }, duration);
            },

            /**
             * Hide alert message
             */
            hideAlert() {
                this.alert.show = false;
                if (this.alert.timeout) {
                    clearTimeout(this.alert.timeout);
                    this.alert.timeout = null;
                }
            },

            /**
             * Show form alert (untuk error/warning di dalam modal)
             */
            showFormAlert(type, title, message) {
                this.formAlert.show = true;
                this.formAlert.type = `alert-${type}`;
                this.formAlert.title = title;
                this.formAlert.message = message;

                // Set icon based on type
                switch (type) {
                    case 'danger':
                        this.formAlert.icon = 'bi bi-exclamation-triangle-fill';
                        break;
                    case 'warning':
                        this.formAlert.icon = 'bi bi-exclamation-triangle-fill';
                        break;
                    default:
                        this.formAlert.icon = 'bi bi-info-circle-fill';
                }
            },

            /**
             * Hide form alert
             */
            hideFormAlert() {
                this.formAlert.show = false;
            },

            /**
             * Show success alert (untuk success di tengah layar)
             */
            showSuccessAlert(title, message) {
                this.successAlert.show = true;
                this.successAlert.title = title;
                this.successAlert.message = message;
            },

            /**
             * Hide success alert
             */
            hideSuccessAlert() {
                this.successAlert.show = false;
            },

            /**
             * Logout function
             */
            logout() {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            },

            /**
             * Load data dari dataBahanAjar.js
             */
            loadDataFromSource() {
                console.log('Loading data from dataBahanAjar.js...');
                console.log('Type of dataBahanAjarSource:', typeof dataBahanAjarSource);

                // Ambil data dari global variable yang didefinisikan di dataBahanAjar.js
                if (typeof dataBahanAjarSource !== 'undefined') {
                    console.log('Data source found, loading...');
                    this.upbjjList = dataBahanAjarSource.upbjjList || [];
                    this.kategoriList = dataBahanAjarSource.kategoriList || [];
                    this.stok = dataBahanAjarSource.stok || [];
                    console.log('Data loaded successfully:', {
                        upbjj: this.upbjjList.length,
                        kategori: this.kategoriList.length,
                        stok: this.stok.length
                    });
                } else {
                    console.warn('Data dari dataBahanAjar.js tidak ditemukan, menggunakan data default');
                    // Fallback data jika dataBahanAjar.js tidak tersedia
                    this.upbjjList = ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"];
                    this.kategoriList = ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"];
                    this.stok = [
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
                        {
                            kode: "EKMA4115",
                            judul: "Pengantar Akuntansi",
                            kategori: "MK Wajib",
                            upbjj: "Jakarta",
                            lokasiRak: "R1-A4",
                            harga: 60000,
                            qty: 7,
                            safety: 15,
                            catatanHTML: "<strong>Cover baru</strong>"
                        },
                        {
                            kode: "BIOL4201",
                            judul: "Biologi Umum (Praktikum)",
                            kategori: "Praktikum",
                            upbjj: "Surabaya",
                            lokasiRak: "R3-B2",
                            harga: 80000,
                            qty: 12,
                            safety: 10,
                            catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
                        },
                        {
                            kode: "FISIP4001",
                            judul: "Dasar-Dasar Sosiologi",
                            kategori: "MK Pilihan",
                            upbjj: "Makassar",
                            lokasiRak: "R2-C1",
                            harga: 55000,
                            qty: 2,
                            safety: 8,
                            catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
                        }
                    ];
                }
            }
        },

        // Lifecycle hooks
        mounted() {
            // Load data saat component di-mount
            this.loadDataFromSource();

            // Load user information
            const user = getCurrentUser();
            if (user) {
                this.userName = user.nama;
            }
        }
    });
}