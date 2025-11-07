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

    document.getElementById('trackingForm').addEventListener('submit', handleTracking);
});

/**
 * Menangani proses pencarian tracking pengiriman
 * @param {Event} event - Event form submission
 */
function handleTracking(event) {
    event.preventDefault();

    const doNumber = document.getElementById('deliveryOrder').value.trim();

    if (!doNumber) {
        alert('Harap masukkan nomor Delivery Order!');
        return;
    }

    // Cari dalam data tracking
    const trackingData = dataTracking[doNumber];

    if (trackingData) {
        displayTrackingResults(trackingData);
    } else {
        displayNoResults();
    }
}

/**
 * Menampilkan hasil tracking pengiriman
 * @param {Object} data - Data tracking yang ditemukan
 */
function displayTrackingResults(data) {
    // Sembunyikan pesan tidak ditemukan, tampilkan hasil
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('trackingResults').style.display = 'block';

    // Isi data ke elemen HTML
    document.getElementById('customerName').textContent = data.nama;
    document.getElementById('orderNumber').textContent = data.nomorDO;
    document.getElementById('courierName').textContent = data.ekspedisi;
    document.getElementById('shipDate').textContent = formatDate(data.tanggalKirim);
    document.getElementById('packageType').textContent = data.paket;
    document.getElementById('totalPayment').textContent = data.total;

    // Set badge status
    const statusElement = document.getElementById('deliveryStatus');
    statusElement.textContent = data.status;
    statusElement.className = 'badge ' + getStatusBadgeClass(data.status);

    // Isi timeline perjalanan
    populateJourneyList(data.perjalanan);

    // Scroll ke hasil
    document.getElementById('trackingResults').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Menampilkan pesan ketika data tracking tidak ditemukan
 */
function displayNoResults() {
    document.getElementById('trackingResults').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';

    // Scroll ke pesan tidak ditemukan
    document.getElementById('noResults').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Mendapatkan kelas CSS badge berdasarkan status pengiriman
 * @param {string} status - Status pengiriman
 * @returns {string} Kelas CSS Bootstrap untuk badge
 */
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'diterima':
            return 'bg-info';
        case 'diproses':
            return 'bg-warning';
        case 'dalam perjalanan':
            return 'bg-primary';
        case 'dikirim':
            return 'bg-success';
        case 'selesai':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

/**
 * Mengisi daftar perjalanan pengiriman
 * @param {Array} journey - Array berisi data perjalanan pengiriman
 */
function populateJourneyList(journey) {
    const container = document.getElementById('journeyList');
    container.innerHTML = '';

    journey.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item';

        listItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${formatDateTime(item.waktu)}</div>
                    ${item.keterangan}
                </div>
                <span class="badge rounded-pill">${index + 1}</span>
            </div>
        `;

        container.appendChild(listItem);
    });
}

/**
 * Memformat tanggal menjadi format Indonesia (DD/MM/YYYY)
 * @param {string} dateString - String tanggal
 * @returns {string} Tanggal yang sudah diformat
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Memformat tanggal dan waktu menjadi format Indonesia (DD/MM/YYYY HH:MM)
 * @param {string} dateTimeString - String tanggal dan waktu
 * @returns {string} Tanggal dan waktu yang sudah diformat
 */
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}