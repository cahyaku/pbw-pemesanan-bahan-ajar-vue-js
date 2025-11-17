/**
 * Aplikasi Vue.js untuk Tracking Pengiriman
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
 * Fungsi untuk menginisialisasi Aplikasi Vue
 */
function initializeVueApp() {
    new Vue({
        el: '#app',
        data: {
            // Informasi pengguna
            userName: 'User',

            // Data dari dataBahanAjar.js
            paketList: [],
            stokList: [],
            trackingData: {},

            // Pencarian
            searchDO: '',

            // Status tampilan
            showResults: false,
            showNoResults: false,
            selectedTracking: null,

            // Data form untuk tambah DO
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

            // Paket yang dipilih untuk menampilkan detail
            selectedPaket: null,

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
            },

            // Alert peringatan untuk ditampilkan di tengah layar
            warningAlert: {
                show: false,
                title: '',
                message: ''
            }
        },

        // Properti terhitung
        computed: {
            /**
             * Menghasilkan nomor DO otomatis
             * Format: DO + Tahun + Nomor Urut (4 digit)
             */
            nextDONumber() {
                const year = new Date().getFullYear();
                const existingDOs = Object.keys(this.trackingData);

                // Filter DO dengan tahun yang sama
                const currentYearDOs = existingDOs.filter(doNum =>
                    doNum.startsWith(`DO${year}-`)
                );

                // Hitung nomor urut berikutnya
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
             * Mengubah objek trackingData menjadi array untuk ditampilkan di tabel
             * Urutkan berdasarkan nomor DO (terbaru di atas)
             */
            trackingList() {
                const list = Object.keys(this.trackingData).map(doNumber => {
                    return {
                        nomorDO: doNumber,
                        ...this.trackingData[doNumber]
                    };
                });

                // Urutkan secara menurun (terbaru di atas)
                return list.sort((a, b) => {
                    return b.nomorDO.localeCompare(a.nomorDO);
                });
            }
        },

        // Pengamat perubahan data
        watch: {
            'formData.paketKode'(newValue, oldValue) {
                if (newValue) {
                    this.updateSelectedPaket();
                } else {
                    this.selectedPaket = null;
                    this.formData.total = 0;
                }
            }
        },

        // Metode-metode
        methods: {
            /**
             * Menangani pencarian tracking
             */
            handleTracking() {
                const doNumber = this.searchDO.trim();

                if (!doNumber) {
                    this.showAlert('warning', 'Input Kosong!', 'Harap masukkan nomor Delivery Order!');
                    return;
                }

                // Validasi format nomor DO
                if (!/^DO\d{4}-\d{4}$/.test(doNumber)) {
                    this.showAlert('warning', 'Format Salah!', 'Format nomor DO harus: DO2025-0001');
                    return;
                }

                // Cari dalam data tracking
                if (this.trackingData[doNumber]) {
                    this.displayTrackingResults(this.trackingData[doNumber]);
                    // Tidak perlu alert untuk pencarian berhasil, langsung tampilkan hasil
                } else {
                    this.displayNoResults();
                    this.showWarningAlert('Data Tidak Ditemukan!', `Nomor DO ${doNumber} tidak ditemukan dalam sistem. Silakan periksa kembali nomor DO yang Anda masukkan.`);
                }
            },

            /**
             * Menampilkan hasil tracking
             */
            displayTrackingResults(data) {
                this.selectedTracking = data;
                this.showResults = true;
                this.showNoResults = false;

                // Gulir ke hasil
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
             * Menutup hasil tracking
             */
            closeResults() {
                this.showResults = false;
                this.showNoResults = false;
                this.selectedTracking = null;
                this.searchDO = ''; // Reset input pencarian
            },

            /**
             * Tampilkan detail tracking dari tabel
             */
            viewTracking(nomorDO) {
                // Atur searchDO dengan nomor DO yang dipilih
                this.searchDO = nomorDO;

                // Cari dan tampilkan data tracking
                if (this.trackingData[nomorDO]) {
                    this.displayTrackingResults(this.trackingData[nomorDO]);

                    // Gulir ke hasil tracking
                    this.$nextTick(() => {
                        const element = document.querySelector('.card');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                } else {
                    this.displayNoResults();
                }
            },

            /**
             * Mendapatkan kelas CSS untuk status badge
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
             * Pengembangan fitur: Tampilkan modal tambah DO
             * Ini yang akan menyiapkan form untuk input DO baru.
             */
            showAddDOModal() {
                this.resetFormData();
                this.formData.nomorDO = this.nextDONumber;
                this.formData.tanggalKirim = this.getCurrentDate();
                this.selectedPaket = null;
                this.openModal();
            },

            /**
             * Memperbarui paket yang dipilih dan harga
             */
            updateSelectedPaket() {
                const paket = this.paketList.find(p => p.kode === this.formData.paketKode);

                if (paket) {
                    this.selectedPaket = paket;
                    this.formData.total = paket.harga;
                } else {
                    this.selectedPaket = null;
                    this.formData.total = 0;
                }
            },

            /**
             * Mendapatkan nama mata kuliah dari kode
             */
            getMatkulName(kode) {
                const matkul = this.stokList.find(s => s.kode === kode);
                return matkul ? matkul.judul : 'Tidak ditemukan';
            },

            /**
             * Mendapatkan tanggal saat ini dalam format YYYY-MM-DD
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
             * Jadi setelah data formnya lengkap,
             * Vue akan menjalankan method ini untuk menyimpan DO baru.
             */
            saveDO() {
                try {
                    // Namun pertama" dilakukan validasi form melalui method validateForm.
                    // Jika valid, maka proses penyimpanan dilanjutkan dan dibuatan object tracking baru.
                    // Jika validasi gagal, proses penyimpanan dihentikan.
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

                    // Tampilkan success alert di tengah layar
                    this.showSuccessAlert('Berhasil!', `Delivery Order ${this.formData.nomorDO} berhasil ditambahkan dan siap untuk pengiriman.`);

                    // Auto search untuk menampilkan DO yang baru dibuat (tanpa alert)
                    this.searchDO = newTracking.nomorDO;
                    // Langsung tampilkan hasil tanpa alert
                    if (this.trackingData[newTracking.nomorDO]) {
                        this.displayTrackingResults(this.trackingData[newTracking.nomorDO]);
                    }

                } catch (error) {
                    this.showFormAlert('danger', 'Gagal Menyimpan!', 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
                }
            },

            /**
             * Validasi form
             */
            validateForm() {
                // Hide form alert sebelum validasi
                this.hideFormAlert();

                if (!this.formData.nim || !this.formData.nama) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'NIM dan Nama harus diisi!');
                    return false;
                }

                if (!this.formData.ekspedisi) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'Ekspedisi harus dipilih!');
                    return false;
                }

                if (!this.formData.paketKode) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'Paket Bahan Ajar harus dipilih!');
                    return false;
                }

                if (!this.formData.tanggalKirim) {
                    this.showFormAlert('warning', 'Data Tidak Lengkap!', 'Tanggal Kirim harus diisi!');
                    return false;
                }

                // Validasi format NIM (contoh: harus angka dan minimal 8 digit)
                if (!/^\d{8,}$/.test(this.formData.nim)) {
                    this.showFormAlert('warning', 'Format Salah!', 'NIM harus berupa angka minimal 8 digit!');
                    return false;
                }

                // Validasi tanggal tidak boleh masa lalu
                const selectedDate = new Date(this.formData.tanggalKirim);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    this.showFormAlert('warning', 'Tanggal Tidak Valid!', 'Tanggal kirim tidak boleh di masa lalu!');
                    return false;
                }

                return true;
            },

            /**
             * Reset data form
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
             * Buka modal
             */
            openModal() {
                const modalEl = document.getElementById('addDOModal');
                if (!this.modalInstance) {
                    this.modalInstance = new bootstrap.Modal(modalEl);
                }
                this.modalInstance.show();
            },

            /**
             * Tutup modal
             */
            closeModal() {
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                this.hideFormAlert(); // Sembunyikan alert form ketika modal ditutup
                this.resetFormData();
            },

            /**
             * Keluar dari sistem
             */
            logout() {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
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
             * Tampilkan/sembunyikan alert peringatan (untuk peringatan di tengah layar)
             */
            showWarningAlert(title, message) {
                this.warningAlert = { show: true, title, message };
            },

            hideWarningAlert() {
                this.warningAlert.show = false;
            },

            /**
             * Muat data dari dataBahanAjar.js
             */
            loadDataFromSource() {
                if (typeof dataBahanAjarSource !== 'undefined') {
                    // Muat daftar paket
                    this.paketList = Array.isArray(dataBahanAjarSource.paket) ?
                        [...dataBahanAjarSource.paket] : [];

                    // Muat daftar stok
                    this.stokList = Array.isArray(dataBahanAjarSource.stok) ?
                        [...dataBahanAjarSource.stok] : [];

                    // Muat data tracking (object, bukan array)
                    this.trackingData = dataBahanAjarSource.tracking ?
                        Object.assign({}, dataBahanAjarSource.tracking) : {};
                } else {
                    this.paketList = [];
                    this.stokList = [];
                    this.trackingData = {};
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