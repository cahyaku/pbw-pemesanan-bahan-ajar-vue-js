/**
 * Inisiasi halaman saat event DOM selesai dimuat (atau DOMContentLoaded)
 */
document.addEventListener('DOMContentLoaded', function () {
    // Menangani pengiriman form login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

/**
 * Menangani proses login pengguna
 * @param {Event} event - Event form submission
 */
function handleLogin(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Bersihkan alert sebelumnya
    clearInlineAlerts();

    // Validasi input
    if (!email || !password) {
        showInlineAlert('loginForm', 'Harap masukkan email dan password!', 'warning');
        return;
    }

    // Periksa kredensial terhadap data pengguna
    const user = dataPengguna.find(u => u.email === email && u.password === password);

    if (user) {
        // Login berhasil
        // Simpan data pengguna ke session storage
        sessionStorage.setItem('currentUser', JSON.stringify(user));

        // Cegah perilaku default dan redirect langsung
        event.preventDefault();
        event.stopPropagation();

        // Bersihkan data form untuk mencegah popup password manager
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        // Reset form secara lengkap
        document.getElementById('loginForm').reset();

        // Gunakan setTimeout untuk memastikan redirect langsung tanpa popup
        setTimeout(() => {
            window.location.replace('dashboard.html');
        }, 50);

    } else {
        // Login gagal - gunakan center alert untuk visibilitas yang lebih baik
        showCenterAlert('Email/password yang anda masukkan salah', 'danger');
    }
}

/**
 * Menangani fitur lupa password
 * Memvalidasi email dan mengirim link reset password (simulasi)
 */
function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();

    // Bersihkan alert sebelumnya di modal
    clearInlineAlerts('forgotPasswordModal');

    if (!email) {
        showInlineAlert('forgotPasswordForm', 'Harap masukkan email Anda!', 'warning');
        return;
    }

    // Periksa apakah email ada di database
    const user = dataPengguna.find(u => u.email === email);

    if (user) {
        showCenterAlert('Link reset password telah dikirim ke email Anda.', 'success');
        // Tutup modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
        modal.hide();
        // Bersihkan form
        document.getElementById('forgotPasswordForm').reset();
    } else {
        showInlineAlert('forgotPasswordForm', 'Email tidak ditemukan dalam sistem.', 'danger');
    }
}

/**
 * Menangani proses pendaftaran pengguna baru
 * Validasi form dan menambahkan pengguna baru ke sistem
 */
function handleRegister() {
    // Ambil nilai dari form
    const nama = document.getElementById('regNama').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const passwordConfirm = document.getElementById('regPasswordConfirm').value.trim();

    // Bersihkan alert sebelumnya di modal
    clearInlineAlerts('registerModal');

    // Validasi semua field
    if (!nama || !email || !password || !passwordConfirm) {
        showInlineAlert('registerForm', 'Harap lengkapi semua field!', 'warning');
        return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showInlineAlert('registerForm', 'Format email tidak valid!', 'warning');
        return;
    }

    // Validasi kecocokan password
    if (password !== passwordConfirm) {
        showInlineAlert('registerForm', 'Password dan konfirmasi password tidak sama!', 'warning');
        return;
    }

    // Validasi panjang password
    if (password.length < 6) {
        showInlineAlert('registerForm', 'Password minimal 6 karakter!', 'warning');
        return;
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = dataPengguna.find(u => u.email === email);
    if (existingUser) {
        showInlineAlert('registerForm', 'Email sudah terdaftar! Gunakan email lain.', 'danger');
        return;
    }

    // Membuat objek pengguna baru
    const newUser = {
        id: dataPengguna.length + 1,
        nama: nama,
        email: email,
        password: password,
        role: "User",
        lokasi: "Default"
    };

    // Tambahkan pengguna ke data (dalam aplikasi nyata, ini akan dikirim ke server)
    dataPengguna.push(newUser);

    // Tampilkan pesan sukses dan tutup modal
    showCenterAlert('Pendaftaran berhasil! Silakan login dengan akun baru Anda.', 'success');

    // Tutup modal langsung
    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    modal.hide();

    // Bersihkan form
    document.getElementById('registerForm').reset();

    // Otomatis isi form login dengan email pengguna baru
    document.getElementById('email').value = email;
}

/**
 * Menampilkan alert inline dalam form
 * @param {string} formId - ID dari form
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe alert (success, danger, warning, info)
 */
function showInlineAlert(formId, message, type) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Membuat elemen alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show inline-alert mt-3 text-center`;
    alertDiv.innerHTML = `
        <i class="bi bi-${getAlertIcon(type)} me-2"></i>
        <strong>${message}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Sisipkan alert setelah form
    form.parentNode.insertBefore(alertDiv, form.nextSibling);

    // Otomatis hapus setelah 5 detik (kecuali untuk pesan sukses)
    if (type !== 'success') {
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Menghapus semua alert inline
 * @param {string|null} containerId - ID container, jika null akan menghapus dari seluruh dokumen
 */
function clearInlineAlerts(containerId = null) {
    let container = document;
    if (containerId) {
        container = document.getElementById(containerId);
        if (!container) return;
    }

    const existingAlerts = container.querySelectorAll('.inline-alert');
    existingAlerts.forEach(alert => alert.remove());
}

/**
 * Menampilkan alert di tengah layar untuk pesan penting
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe alert (success, danger, warning, info)
 */
function showCenterAlert(message, type) {
    // Hapus alert tengah yang ada
    const existingCenterAlerts = document.querySelectorAll('.center-alert');
    existingCenterAlerts.forEach(alert => alert.remove());

    // Buat overlay
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // Buat elemen alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show center-alert`;
    alertDiv.style.cssText = `
        min-width: 300px;
        max-width: 500px;
        margin: 0;
        border-radius: 15px;
        border: 3px solid;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        font-size: 1.1rem;
        font-weight: 600;
        text-align: center;
        position: relative;
    `;

    // Terapkan warna kustom berdasarkan tipe
    if (type === 'success') {
        alertDiv.style.backgroundColor = '#d4edda';
        alertDiv.style.borderColor = '#22577a';
        alertDiv.style.color = '#0f3d2f';
    } else if (type === 'danger') {
        alertDiv.style.backgroundColor = '#f8d7da';
        alertDiv.style.borderColor = '#dc3545';
        alertDiv.style.color = '#721c24';
    } else if (type === 'warning') {
        alertDiv.style.backgroundColor = '#fff3cd';
        alertDiv.style.borderColor = '#ffc107';
        alertDiv.style.color = '#856404';
    }

    alertDiv.innerHTML = `
        <i class="bi bi-${getAlertIcon(type)} me-2" style="font-size: 1.3rem;"></i>
        <strong>${message}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" 
                style="position: absolute; top: 50%; right: 15px; transform: translateY(-50%); 
                       opacity: 0.8; width: 20px; height: 20px; background-size: 14px; 
                       margin: 0; padding: 0; display: flex; align-items: center; justify-content: center;"></button>
    `;

    // Tambahkan event click untuk menutup dengan klik overlay
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Tambahkan alert ke overlay
    overlay.appendChild(alertDiv);

    // Tambahkan ke body
    document.body.appendChild(overlay);

    // Otomatis hapus setelah 2 detik (lebih cepat untuk UX yang lebih baik)
    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.remove();
        }
    }, type === 'success' ? 1500 : 2000);
}

/**
 * Fungsi legacy untuk kompatibilitas - sekarang menggunakan center alert untuk UX yang lebih baik
 * @param {string} message - Pesan alert
 * @param {string} type - Tipe alert
 */
function showAlert(message, type) {
    showCenterAlert(message, type);
}

/**
 * Mendapatkan ikon Bootstrap berdasarkan tipe alert
 * @param {string} type - Tipe alert
 * @returns {string} Nama kelas ikon Bootstrap
 */
function getAlertIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle-fill';
        case 'danger':
            return 'exclamation-triangle-fill';
        case 'warning':
            return 'exclamation-circle-fill';
        case 'info':
            return 'info-circle-fill';
        default:
            return 'info-circle-fill';
    }
}

/**
 * Fungsi utilitas untuk memeriksa apakah pengguna sudah login
 * @returns {boolean} True jika pengguna sudah login
 */
function isLoggedIn() {
    return sessionStorage.getItem('currentUser') !== null;
}

/**
 * Fungsi utilitas untuk mendapatkan data pengguna saat ini
 * @returns {Object|null} Data pengguna atau null jika tidak ada
 */
function getCurrentUser() {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Fungsi utilitas untuk logout pengguna
 * Menghapus data session dan redirect ke halaman login
 */
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

