"""Lapisan database (SQLite) untuk Website Belajar Islami."""
import sqlite3
from datetime import datetime, timezone

from flask import current_app, g
from werkzeug.security import generate_password_hash


def get_db():
    """Kembalikan koneksi database untuk request saat ini."""
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(exception=None):  # noqa: ARG001
    """Tutup koneksi database di akhir request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Buat tabel dan admin default bila belum ada."""
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'Umum',
            summary TEXT NOT NULL DEFAULT '',
            content_html TEXT NOT NULL,
            author_id INTEGER,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
        );
        """
    )
    db.commit()
    _ensure_default_admin(db)


def _ensure_default_admin(db):
    """Pastikan ada minimal satu akun admin."""
    existing = db.execute("SELECT COUNT(*) AS n FROM users").fetchone()
    if existing["n"] == 0:
        db.execute(
            "INSERT INTO users (username, password_hash, is_admin, created_at)"
            " VALUES (?, ?, 1, ?)",
            (
                current_app.config["ADMIN_USERNAME"],
                generate_password_hash(current_app.config["ADMIN_PASSWORD"]),
                _now(),
            ),
        )
        db.commit()


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def init_app(app):
    """Daftarkan hook database ke aplikasi Flask."""
    app.teardown_appcontext(close_db)
