/**
 * Vue.js Application for Tracking Pengiriman
 * Menggunakan Vue 2.x untuk mengelola tracking delivery order
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
 * Fungsi untuk menginisialisasi Vue Application
 */
function initializeVueApp() {
    new Vue({
        el: '#app',
        data: {
            // User information
            userName: 'User',

            // Data dari dataBahanAjar.js
            paketList: [],
            stokList: [],
            trackingData: {},

            // Search
            searchDO: '',

            // Display states
            showResults: false,
            showNoResults: false,
            selectedTracking: null,

            // Form data untuk tambah DO
            formData: {
                nomorDO: '',
                nim: '',
                nama: '',
                ekspedisi: '',
                paketKode: '',
                tanggalKirim: '',
                status: 'Diproses',
                total: 0
            },

            // Selected paket untuk menampilkan detail
            selectedPaket: null,

            // Bootstrap modal instance
            modalInstance: null
        },

        // Computed properties
        computed: {
            /**
             * Generate nomor DO otomatis
             * Format: DO + Tahun + Sequence Number (3 digit)
             */
            nextDONumber() {
                const year = new Date().getFullYear();
                const existingDOs = Object.keys(this.trackingData);

                // Filter DO dengan tahun yang sama
                const currentYearDOs = existingDOs.filter(doNum =>
                    doNum.startsWith(`DO${year}-`)
                );

                // Hitung sequence number berikutnya
                let maxSequence = 0;
                currentYearDOs.forEach(doNum => {
                    const parts = doNum.split('-');
                    if (parts.length === 2) {
                        const seq = parseInt(parts[1]);
                        if (seq > maxSequence) {
                            maxSequence = seq;
                        }
                    }
                });

                const nextSequence = maxSequence + 1;
                return `DO${year}-${String(nextSequence).padStart(4, '0')}`;
            },

            /**
             * Convert trackingData object to array untuk ditampilkan di tabel
             * Urutkan berdasarkan nomor DO (terbaru di atas)
             */
            trackingList() {
                const list = Object.keys(this.trackingData).map(doNumber => {
                    return {
                        nomorDO: doNumber,
                        ...this.trackingData[doNumber]
                    };
                });

                // Sort descending (terbaru di atas)
                return list.sort((a, b) => {
                    return b.nomorDO.localeCompare(a.nomorDO);
                });
            }
        },

        // Watchers
        watch: {
            'formData.paketKode'(newValue, oldValue) {
                console.log('Paket changed from:', oldValue, 'to:', newValue);
                if (newValue) {
                    this.updateSelectedPaket();
                } else {
                    this.selectedPaket = null;
                    this.formData.total = 0;
                }
            }
        },

        // Methods
        methods: {
            /**
             * Handle pencarian tracking
             */
            handleTracking() {
                const doNumber = this.searchDO.trim();

                if (!doNumber) {
                    alert('Harap masukkan nomor Delivery Order!');
                    return;
                }

                // Cari dalam data tracking
                if (this.trackingData[doNumber]) {
                    this.displayTrackingResults(this.trackingData[doNumber]);
                } else {
                    this.displayNoResults();
                }
            },

            /**
             * Menampilkan hasil tracking
             */
            displayTrackingResults(data) {
                this.selectedTracking = data;
                this.showResults = true;
                this.showNoResults = false;

                // Scroll ke hasil
                this.$nextTick(() => {
                    const element = document.querySelector('.card');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            },

            /**
             * Menampilkan pesan tidak ditemukan
             */
            displayNoResults() {
                this.selectedTracking = null;
                this.showResults = false;
                this.showNoResults = true;
            },

            /**
             * Get CSS class untuk status badge
             */
            getStatusBadgeClass(status) {
                if (!status) return 'bg-secondary';

                switch (status.toLowerCase()) {
                    case 'diterima':
                        return 'bg-info';
                    case 'diproses':
                        return 'bg-warning text-dark';
                    case 'dalam perjalanan':
                        return 'bg-primary';
                    case 'dikirim':
                        return 'bg-success';
                    case 'selesai':
                        return 'bg-success';
                    default:
                        return 'bg-secondary';
                }
            },

            /**
             * Format tanggal
             */
            formatDate(dateString) {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            },

            /**
             * Format tanggal dan waktu
             */
            formatDateTime(dateTimeString) {
                if (!dateTimeString) return '-';
                const date = new Date(dateTimeString);
                return date.toLocaleString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },

            /**
             * Tampilkan modal tambah DO
             */
            showAddDOModal() {
                console.log('Opening modal...');
                console.log('paketList available:', this.paketList);
                console.log('paketList length:', this.paketList.length);

                this.resetFormData();
                this.formData.nomorDO = this.nextDONumber;
                this.formData.tanggalKirim = this.getCurrentDate();
                this.selectedPaket = null; // Reset selected paket
                this.openModal();
            },

            /**
             * Handle perubahan paket
             */
            onPaketChange() {
                console.log('onPaketChange triggered, paketKode:', this.formData.paketKode);
                this.updateSelectedPaket();
            },

            /**
             * Update selected paket dan harga
             */
            updateSelectedPaket() {
                console.log('Updating selected paket...');
                console.log('Current paketKode:', this.formData.paketKode);
                console.log('Available paketList:', this.paketList);
                
                const paket = this.paketList.find(p => p.kode === this.formData.paketKode);
                console.log('Found paket:', paket);
                
                if (paket) {
                    this.selectedPaket = paket;
                    this.formData.total = paket.harga;
                    console.log('✓ Selected paket set:', this.selectedPaket);
                    console.log('✓ Total harga:', this.formData.total);
                } else {
                    this.selectedPaket = null;
                    this.formData.total = 0;
                    console.log('✗ No paket found, reset to null');
                }
            },

            /**
             * Get nama mata kuliah dari kode
             */
            getMatkulName(kode) {
                const matkul = this.stokList.find(s => s.kode === kode);
                return matkul ? matkul.judul : 'Tidak ditemukan';
            },

            /**
             * Get current date in YYYY-MM-DD format
             */
            getCurrentDate() {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            },

            /**
             * Simpan DO baru
             */
            saveDO() {
                // Validasi form
                if (!this.validateForm()) {
                    return;
                }

                // Get paket name
                const paket = this.paketList.find(p => p.kode === this.formData.paketKode);
                const paketName = paket ? `${paket.kode} - ${paket.nama}` : this.formData.paketKode;

                // Buat object tracking baru
                const newTracking = {
                    nomorDO: this.formData.nomorDO,
                    nim: this.formData.nim,
                    nama: this.formData.nama,
                    status: this.formData.status,
                    ekspedisi: this.formData.ekspedisi,
                    tanggalKirim: this.formData.tanggalKirim,
                    paket: paketName,
                    total: this.formData.total,
                    perjalanan: [
                        {
                            waktu: new Date().toISOString(),
                            keterangan: `DO dibuat dengan status: ${this.formData.status}`
                        }
                    ]
                };

                // Tambahkan ke trackingData
                this.$set(this.trackingData, this.formData.nomorDO, newTracking);

                // Update dataBahanAjarSource jika ada
                if (typeof dataBahanAjarSource !== 'undefined' && dataBahanAjarSource.tracking) {
                    dataBahanAjarSource.tracking[this.formData.nomorDO] = newTracking;
                }

                // Tutup modal terlebih dahulu
                this.closeModal();

                // Tampilkan pop up success
                alert('✓ Delivery Order berhasil ditambahkan!\n\nNomor DO: ' + this.formData.nomorDO);

                // Auto search untuk menampilkan DO yang baru dibuat
                this.searchDO = newTracking.nomorDO;
                this.handleTracking();
            },

            /**
             * Validasi form
             */
            validateForm() {
                if (!this.formData.nim || !this.formData.nama) {
                    alert('NIM dan Nama harus diisi!');
                    return false;
                }

                if (!this.formData.ekspedisi) {
                    alert('Ekspedisi harus dipilih!');
                    return false;
                }

                if (!this.formData.paketKode) {
                    alert('Paket Bahan Ajar harus dipilih!');
                    return false;
                }

                if (!this.formData.tanggalKirim) {
                    alert('Tanggal Kirim harus diisi!');
                    return false;
                }

                return true;
            },

            /**
             * Reset form data
             */
            resetFormData() {
                this.formData = {
                    nomorDO: '',
                    nim: '',
                    nama: '',
                    ekspedisi: '',
                    paketKode: '',
                    tanggalKirim: '',
                    status: 'Diproses',
                    total: 0
                };
                this.selectedPaket = null;
            },

            /**
             * Open modal
             */
            openModal() {
                const modalEl = document.getElementById('addDOModal');
                if (!this.modalInstance) {
                    this.modalInstance = new bootstrap.Modal(modalEl);
                }
                this.modalInstance.show();
            },

            /**
             * Close modal
             */
            closeModal() {
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                this.resetFormData();
            },

            /**
             * Logout
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
                console.log('dataBahanAjarSource exists?', typeof dataBahanAjarSource !== 'undefined');

                if (typeof dataBahanAjarSource !== 'undefined') {
                    console.log('Raw dataBahanAjarSource:', dataBahanAjarSource);

                    // Load paket list - use Vue.set for reactivity
                    if (dataBahanAjarSource.paket && Array.isArray(dataBahanAjarSource.paket)) {
                        this.paketList = [...dataBahanAjarSource.paket];
                        console.log('✓ Paket List loaded:', this.paketList);
                    } else {
                        this.paketList = [];
                        console.warn('✗ Paket list is empty or invalid');
                    }

                    // Load stok list
                    if (dataBahanAjarSource.stok && Array.isArray(dataBahanAjarSource.stok)) {
                        this.stokList = [...dataBahanAjarSource.stok];
                        console.log('✓ Stok List loaded:', this.stokList);
                    } else {
                        this.stokList = [];
                        console.warn('✗ Stok list is empty or invalid');
                    }

                    // trackingData adalah object, bukan array, jadi assign langsung
                    if (dataBahanAjarSource.tracking) {
                        // Copy object tracking agar reactive
                        this.trackingData = Object.assign({}, dataBahanAjarSource.tracking);
                        console.log('✓ Tracking Data loaded:', this.trackingData);
                    } else {
                        this.trackingData = {};
                        console.warn('✗ Tracking data is empty');
                    }
                } else {
                    console.error('❌ dataBahanAjarSource tidak ditemukan!');
                    this.paketList = [];
                    this.stokList = [];
                    this.trackingData = {};
                }

                console.log('Final state - paketList length:', this.paketList.length);
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