"""Website Belajar Islami.

Aplikasi Flask sederhana di mana admin dapat mengunggah materi
pembelajaran berbentuk HTML, dan pengunjung dapat membacanya.
"""
import functools
import os

from flask import (
    Flask,
    abort,
    flash,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash

import db as database
from config import Config
from sanitizer import sanitize_html


def create_app(config_object=Config):
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(config_object)

    os.makedirs(os.path.dirname(app.config["DATABASE"]), exist_ok=True)

    database.init_app(app)

    with app.app_context():
        database.init_db()

    _register_auth(app)
    _register_public_routes(app)
    _register_admin_routes(app)

    @app.context_processor
    def inject_globals():
        from datetime import datetime, timezone

        return {"current_year": datetime.now(timezone.utc).year}

    return app


# --------------------------------------------------------------------------- #
# Autentikasi
# --------------------------------------------------------------------------- #
def _register_auth(app):
    @app.before_request
    def load_logged_in_user():
        user_id = session.get("user_id")
        if user_id is None:
            g.user = None
        else:
            g.user = database.get_db().execute(
                "SELECT id, username, is_admin FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()

    @app.route("/login", methods=("GET", "POST"))
    def login():
        if request.method == "POST":
            username = (request.form.get("username") or "").strip()
            password = request.form.get("password") or ""
            user = database.get_db().execute(
                "SELECT * FROM users WHERE username = ?", (username,)
            ).fetchone()

            if user is None or not check_password_hash(
                user["password_hash"], password
            ):
                flash("Nama pengguna atau kata sandi salah.", "error")
            else:
                session.clear()
                session["user_id"] = user["id"]
                flash("Berhasil masuk. Selamat datang!", "success")
                return redirect(url_for("admin_dashboard"))
        return render_template("login.html")

    @app.route("/logout")
    def logout():
        session.clear()
        flash("Anda telah keluar.", "success")
        return redirect(url_for("index"))


def admin_required(view):
    """Dekorator: hanya izinkan admin yang sudah login."""

    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None or not g.user["is_admin"]:
            flash("Silakan masuk sebagai admin terlebih dahulu.", "error")
            return redirect(url_for("login"))
        return view(**kwargs)

    return wrapped_view


# --------------------------------------------------------------------------- #
# Halaman publik
# --------------------------------------------------------------------------- #
def _register_public_routes(app):
    @app.route("/")
    def index():
        db = database.get_db()
        q = (request.args.get("q") or "").strip()
        category = (request.args.get("category") or "").strip()

        sql = (
            "SELECT id, title, category, summary, created_at, updated_at "
            "FROM materials"
        )
        clauses = []
        params = []
        if q:
            clauses.append("(title LIKE ? OR summary LIKE ?)")
            params.extend([f"%{q}%", f"%{q}%"])
        if category:
            clauses.append("category = ?")
            params.append(category)
        if clauses:
            sql += " WHERE " + " AND ".join(clauses)
        sql += " ORDER BY updated_at DESC"

        materials = db.execute(sql, params).fetchall()
        categories = db.execute(
            "SELECT DISTINCT category FROM materials ORDER BY category"
        ).fetchall()
        return render_template(
            "index.html",
            materials=materials,
            categories=[row["category"] for row in categories],
            q=q,
            active_category=category,
        )

    @app.route("/materi/<int:material_id>")
    def view_material(material_id):
        material = database.get_db().execute(
            "SELECT * FROM materials WHERE id = ?", (material_id,)
        ).fetchone()
        if material is None:
            abort(404)
        return render_template("material.html", material=material)


# --------------------------------------------------------------------------- #
# Panel admin
# --------------------------------------------------------------------------- #
def _register_admin_routes(app):
    @app.route("/admin")
    @admin_required
    def admin_dashboard():
        materials = database.get_db().execute(
            "SELECT id, title, category, updated_at FROM materials "
            "ORDER BY updated_at DESC"
        ).fetchall()
        return render_template("admin/dashboard.html", materials=materials)

    @app.route("/admin/materi/baru", methods=("GET", "POST"))
    @admin_required
    def admin_create_material():
        if request.method == "POST":
            error = _save_material(None)
            if error is None:
                flash("Materi berhasil diunggah.", "success")
                return redirect(url_for("admin_dashboard"))
            flash(error, "error")
        return render_template(
            "admin/material_form.html", material=None, action="create"
        )

    @app.route("/admin/materi/<int:material_id>/edit", methods=("GET", "POST"))
    @admin_required
    def admin_edit_material(material_id):
        db = database.get_db()
        material = db.execute(
            "SELECT * FROM materials WHERE id = ?", (material_id,)
        ).fetchone()
        if material is None:
            abort(404)

        if request.method == "POST":
            error = _save_material(material_id)
            if error is None:
                flash("Materi berhasil diperbarui.", "success")
                return redirect(url_for("admin_dashboard"))
            flash(error, "error")
        return render_template(
            "admin/material_form.html", material=material, action="edit"
        )

    @app.route("/admin/materi/<int:material_id>/hapus", methods=("POST",))
    @admin_required
    def admin_delete_material(material_id):
        db = database.get_db()
        material = db.execute(
            "SELECT id FROM materials WHERE id = ?", (material_id,)
        ).fetchone()
        if material is None:
            abort(404)
        db.execute("DELETE FROM materials WHERE id = ?", (material_id,))
        db.commit()
        flash("Materi telah dihapus.", "success")
        return redirect(url_for("admin_dashboard"))


def _save_material(material_id):
    """Simpan materi baru atau perbarui yang ada.

    Mengembalikan pesan error (str) bila validasi gagal, atau None bila sukses.
    Konten HTML dapat berasal dari textarea atau berkas .html yang diunggah.
    """
    from db import _now  # impor lokal untuk menghindari siklus

    title = (request.form.get("title") or "").strip()
    category = (request.form.get("category") or "").strip() or "Umum"
    summary = (request.form.get("summary") or "").strip()
    content = request.form.get("content_html") or ""

    uploaded = request.files.get("html_file")
    if uploaded and uploaded.filename:
        filename = uploaded.filename.lower()
        if not (filename.endswith(".html") or filename.endswith(".htm")):
            return "Berkas yang diunggah harus berformat .html atau .htm."
        try:
            content = uploaded.read().decode("utf-8", errors="replace")
        except Exception:  # noqa: BLE001
            from flask import current_app

            current_app.logger.exception("Gagal membaca berkas HTML yang diunggah")
            return "Gagal membaca berkas HTML yang diunggah."

    if not title:
        return "Judul materi wajib diisi."
    if not content.strip():
        return "Konten materi (HTML) wajib diisi atau unggah berkas .html."

    safe_content = sanitize_html(content)
    db = database.get_db()
    now = _now()

    if material_id is None:
        db.execute(
            "INSERT INTO materials "
            "(title, category, summary, content_html, author_id, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (title, category, summary, safe_content, g.user["id"], now, now),
        )
    else:
        db.execute(
            "UPDATE materials SET title = ?, category = ?, summary = ?, "
            "content_html = ?, updated_at = ? WHERE id = ?",
            (title, category, summary, safe_content, now, material_id),
        )
    db.commit()
    return None


app = create_app()


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=debug)
