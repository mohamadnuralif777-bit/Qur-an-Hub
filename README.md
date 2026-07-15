# Belajar Islami · Qur'an Hub

Website belajar islami sederhana berbasis **Flask + SQLite** di mana **admin dapat
mengunggah materi pembelajaran berbentuk HTML**, dan pengunjung dapat membacanya.

## Fitur

- **Halaman publik**: daftar materi, pencarian, filter kategori, dan halaman baca materi.
- **Panel admin** (perlu login):
  - Unggah materi HTML — tulis/tempel kode HTML langsung, **atau** unggah berkas `.html`.
  - Edit dan hapus materi.
- **Keamanan**: konten HTML materi otomatis **disanitasi** (skrip & elemen berbahaya
  dihapus, `javascript:` diblokir) untuk mencegah XSS, meski tetap mendukung format
  kaya (judul, daftar, tabel, gambar, gaya inline sederhana).

## Menjalankan secara lokal

```bash
# 1. Buat virtual environment (opsional) & pasang dependensi
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Jalankan aplikasi
python app.py
```

Buka http://localhost:5000

### Akun admin default

- Username: `admin`
- Password: `admin123`

> **Penting:** ganti kredensial dan kunci rahasia di lingkungan produksi melalui
> variabel lingkungan `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `SECRET_KEY`.
> Nilai default hanya untuk pengembangan.

## Konfigurasi (variabel lingkungan)

| Variabel          | Default                          | Keterangan                     |
|-------------------|----------------------------------|--------------------------------|
| `SECRET_KEY`      | `dev-secret-change-me`           | Kunci penandatangan session.   |
| `DATABASE_PATH`   | `instance/belajar_islami.db`     | Lokasi berkas SQLite.          |
| `ADMIN_USERNAME`  | `admin`                          | Username admin awal.           |
| `ADMIN_PASSWORD`  | `admin123`                       | Password admin awal.           |
| `PORT`            | `5000`                           | Port server.                   |

## Menjalankan pengujian

```bash
pip install pytest
python -m pytest
```

## Struktur proyek

```
app.py              # Aplikasi Flask (rute publik & admin)
config.py           # Konfigurasi
db.py               # Lapisan database SQLite + inisialisasi
sanitizer.py        # Sanitasi HTML materi (anti-XSS)
requirements.txt    # Dependensi Python
templates/          # Template Jinja2 (publik & admin)
static/css/         # Gaya (tema islami)
tests/              # Pengujian pytest
```
