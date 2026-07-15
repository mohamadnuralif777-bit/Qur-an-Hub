"""Konfigurasi aplikasi Website Belajar Islami."""
import os


class Config:
    """Konfigurasi dasar aplikasi."""

    # Kunci rahasia untuk menandatangani session. Wajib di-set lewat env di produksi.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # Lokasi database SQLite.
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE = os.environ.get(
        "DATABASE_PATH", os.path.join(BASE_DIR, "instance", "belajar_islami.db")
    )

    # Kredensial admin awal (dipakai saat inisialisasi database jika belum ada admin).
    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

    # Batas ukuran unggahan/isi materi (2 MB) untuk mencegah penyalahgunaan.
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024
