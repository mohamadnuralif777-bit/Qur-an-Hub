"""Pengujian dasar untuk Website Belajar Islami."""
import os
import tempfile

import pytest

import app as app_module
from config import Config

# Kredensial admin tetap untuk pengujian (independen dari variabel lingkungan).
TEST_PW = "admin123"


@pytest.fixture()
def client():
    db_fd, db_path = tempfile.mkstemp(suffix=".db")

    class TestConfig(Config):
        TESTING = True
        SECRET_KEY = "test-secret"
        DATABASE = db_path
        ADMIN_USERNAME = "admin"
        ADMIN_PASSWORD = TEST_PW
        WTF_CSRF_ENABLED = False

    flask_app = app_module.create_app(TestConfig)
    with flask_app.test_client() as client:
        yield client

    os.close(db_fd)
    os.unlink(db_path)


ADMIN_PW = TEST_PW


def login(client, username="admin", password=None):
    if password is None:
        password = ADMIN_PW
    return client.post(
        "/login",
        data={"username": username, "password": password},
        follow_redirects=True,
    )


def create_material(client, title="Adab Menuntut Ilmu", content="<h2>Bab 1</h2><p>Isi materi.</p>"):
    return client.post(
        "/admin/materi/baru",
        data={"title": title, "category": "Akhlak", "summary": "Ringkasan", "content_html": content},
        follow_redirects=True,
    )


def test_index_empty(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "Belajar Islami" in resp.get_data(as_text=True)


def test_admin_requires_login(client):
    resp = client.get("/admin", follow_redirects=True)
    assert "Masuk Admin" in resp.get_data(as_text=True)


def test_login_wrong_credentials(client):
    resp = login(client, password="wrong-secret")
    assert "salah" in resp.get_data(as_text=True).lower()


def test_login_and_create_material(client):
    login(client)
    resp = create_material(client)
    text = resp.get_data(as_text=True)
    assert "berhasil diunggah" in text.lower()

    # Materi tampil di beranda dan halaman detail.
    home = client.get("/").get_data(as_text=True)
    assert "Adab Menuntut Ilmu" in home
    detail = client.get("/materi/1").get_data(as_text=True)
    assert "Bab 1" in detail


def test_material_content_is_sanitized(client):
    login(client)
    malicious = '<p>Aman</p><script>alert("xss")</script><a href="javascript:alert(1)">klik</a>'
    create_material(client, title="Uji XSS", content=malicious)
    detail = client.get("/materi/1").get_data(as_text=True)
    assert "<script>" not in detail
    assert "javascript:alert" not in detail
    assert "Aman" in detail


def test_upload_html_file(client):
    import io

    login(client)
    data = {
        "title": "Dari Berkas",
        "category": "Fiqih",
        "summary": "",
        "content_html": "",
        "html_file": (io.BytesIO(b"<h3>Wudhu</h3><p>Tata cara.</p>"), "materi.html"),
    }
    resp = client.post("/admin/materi/baru", data=data, content_type="multipart/form-data", follow_redirects=True)
    assert "berhasil diunggah" in resp.get_data(as_text=True).lower()
    detail = client.get("/materi/1").get_data(as_text=True)
    assert "Wudhu" in detail


def test_edit_and_delete_material(client):
    login(client)
    create_material(client)
    # Edit
    resp = client.post(
        "/admin/materi/1/edit",
        data={"title": "Judul Baru", "category": "Akhlak", "summary": "", "content_html": "<p>Update</p>"},
        follow_redirects=True,
    )
    assert "diperbarui" in resp.get_data(as_text=True).lower()
    assert "Judul Baru" in client.get("/materi/1").get_data(as_text=True)
    # Delete
    resp = client.post("/admin/materi/1/hapus", follow_redirects=True)
    assert "dihapus" in resp.get_data(as_text=True).lower()
    assert client.get("/materi/1").status_code == 404


def test_missing_title_rejected(client):
    login(client)
    resp = client.post(
        "/admin/materi/baru",
        data={"title": "", "category": "", "summary": "", "content_html": "<p>x</p>"},
        follow_redirects=True,
    )
    assert "judul" in resp.get_data(as_text=True).lower()
