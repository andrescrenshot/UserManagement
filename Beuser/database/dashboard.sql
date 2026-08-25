-- Tabel ini KHUSUS Dashboard.
-- Tabel User/Login TIDAK disentuh oleh endpoint /api/tambah-user.

CREATE TABLE IF NOT EXISTS tambah_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(2) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    noHp VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    tanggalLahir VARCHAR(20) NOT NULL,
    roles VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

SELECT * FROM tambah_user ORDER BY id;
