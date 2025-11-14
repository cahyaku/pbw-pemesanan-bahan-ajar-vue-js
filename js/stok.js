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
            modalInstance: null
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
                this.showAlert('Filter dan sorting telah direset', 'info');
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
                // Validasi form
                if (!this.validateForm()) {
                    return;
                }

                if (this.editMode) {
                    // Update stok yang ada
                    this.$set(this.stok, this.editIndex, { ...this.formData });
                    this.showAlert('Stok bahan ajar berhasil diupdate!', 'success');
                } else {
                    // Cek duplikasi kode
                    const exists = this.stok.some(item => item.kode === this.formData.kode);
                    if (exists) {
                        this.showAlert('Kode mata kuliah sudah ada dalam sistem!', 'warning');
                        return;
                    }

                    // Tambah stok baru
                    // Karena this.stok merujuk ke dataBahanAjarSource.stok,
                    // push ke this.stok otomatis update dataBahanAjarSource juga
                    this.stok.push({ ...this.formData });

                    this.showAlert('Stok bahan ajar berhasil ditambahkan!', 'success');
                }

                this.closeModal();
            },

            /**
             * Validasi form sebelum submit
             * @returns {boolean} True jika valid
             */
            validateForm() {
                if (!this.formData.kode || !this.formData.judul) {
                    this.showAlert('Kode dan Nama Mata Kuliah harus diisi!', 'warning');
                    return false;
                }

                if (!this.formData.kategori || !this.formData.upbjj) {
                    this.showAlert('Kategori dan UT-Daerah harus dipilih!', 'warning');
                    return false;
                }

                if (!this.formData.lokasiRak) {
                    this.showAlert('Lokasi Rak harus diisi!', 'warning');
                    return false;
                }

                if (this.formData.qty < 0 || this.formData.safety < 0) {
                    this.showAlert('Jumlah stok dan safety stock tidak boleh negatif!', 'warning');
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
                this.resetFormData();
            },

            /**
             * Menampilkan alert message
             * @param {string} message - Pesan yang akan ditampilkan
             * @param {string} type - Tipe alert (success, warning, danger, info)
             */
            showAlert(message, type) {
                alert(message);
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