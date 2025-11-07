/**
 * Inisiasi halaman saat event DOM selesai dimuat (atau DOMContentLoaded)
 */
document.addEventListener('DOMContentLoaded', function () {
    // Periksa apakah pengguna sudah login
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    loadDashboard();
    updateTimeGreeting();

    // Perbarui waktu setiap detik untuk tampilan real-time
    setInterval(updateTimeGreeting, 1000);
});

/**
 * Memuat data dashboard dan informasi pengguna
 * Menampilkan nama pengguna dan pesan selamat datang
 */
function loadDashboard() {
    const user = getCurrentUser();

    if (user) {
        // Perbarui informasi pengguna
        document.getElementById('userName').textContent = user.nama;
        document.getElementById('welcomeMessage').innerHTML = `
            Selamat datang, <strong>${user.nama}</strong>!<br>
            ${user.role} - ${user.lokasi}
        `;
    }
}

/**
 * Fungsi salam berdasarkan waktu
 * Menampilkan salam yang sesuai dengan waktu saat ini dan tanggal/waktu real-time
 */
function updateTimeGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const timeGreetingElement = document.getElementById('timeGreeting');
    const currentDateTimeElement = document.getElementById('currentDateTime');

    let greeting = '';
    let icon = '';

    // Tentukan salam berdasarkan waktu
    if (hour >= 5 && hour < 11) {
        greeting = 'Selamat Pagi';
        icon = '🌅';
    } else if (hour >= 11 && hour < 15) {
        greeting = 'Selamat Siang';
        icon = '☀️';
    } else if (hour >= 15 && hour < 18) {
        greeting = 'Selamat Sore';
        icon = '🌤️';
    } else {
        greeting = 'Selamat Malam';
        icon = '🌙';
    }

    if (timeGreetingElement) {
        timeGreetingElement.textContent = `${greeting} ${icon}`;
    }

    // Perbarui tanggal dan waktu dengan format kustom: Minggu, 27 Oktober 2025, pukul 01:56:40 AM
    if (currentDateTimeElement) {
        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        const dateString = now.toLocaleDateString('id-ID', dateOptions);
        const timeString = now.toLocaleTimeString('en-US', timeOptions);

        currentDateTimeElement.textContent = `${dateString}, pukul ${timeString}`;
    }
}

/**
 * Fungsi navigasi untuk menu dashboard
 * @param {string} page - Nama halaman yang akan dibuka
 */
function navigateTo(page) {
    switch (page) {
        case 'info-bahan-ajar':
            window.location.href = 'stok.html';
            break;
        case 'tracking':
            window.location.href = 'tracking.html';
            break;
        case 'histori':
            showAlert('Fitur Histori Transaksi belum tersedia', 'warning');
            break;
        case 'monitoring-progress':
            showAlert('Fitur Monitoring Progress DO Bahan Ajar belum tersedia', 'warning');
            break;
        case 'rekap-bahan-ajar':
            showAlert('Fitur Rekap Bahan Ajar belum tersedia', 'warning');
            break;
        default:
            showAlert('Halaman dalam pengembangan', 'warning');
    }
}

/**
 * Mengalihkan tampilan submenu laporan
 * Menampilkan atau menyembunyikan submenu dengan animasi chevron
 */
function toggleReportSubmenu() {
    const submenu = document.getElementById('reportSubmenu');
    const chevron = document.getElementById('reportChevron');

    if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        submenu.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

