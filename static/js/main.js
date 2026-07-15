// Perilaku UI Belajar Islami (dipisah dari markup demi kompatibilitas CSP).
document.addEventListener("DOMContentLoaded", function () {
  // Auto-submit form filter saat kategori berubah.
  document.querySelectorAll("[data-autosubmit]").forEach(function (el) {
    el.addEventListener("change", function () {
      if (el.form) {
        el.form.submit();
      }
    });
  });

  // Konfirmasi sebelum menghapus materi.
  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (!window.confirm(form.getAttribute("data-confirm"))) {
        event.preventDefault();
      }
    });
  });
});
