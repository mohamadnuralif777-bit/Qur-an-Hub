"""Sanitasi HTML materi untuk mencegah XSS namun tetap kaya format.

Meski unggahan hanya dilakukan admin (tepercaya), materi HTML tetap
disanitasi sebelum disimpan/ditampilkan agar aman dari skrip berbahaya
(mis. akun admin yang disalahgunakan atau kesalahan copy-paste).
"""
import bleach
import bleach.css_sanitizer

# Tag HTML yang diizinkan untuk konten materi pembelajaran.
ALLOWED_TAGS = [
    "a", "abbr", "b", "blockquote", "br", "caption", "code", "col", "colgroup",
    "dd", "div", "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3",
    "h4", "h5", "h6", "hr", "i", "img", "li", "ol", "p", "pre", "q", "s",
    "small", "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot",
    "th", "thead", "tr", "u", "ul",
]

ALLOWED_ATTRIBUTES = {
    "*": ["class", "id", "style", "title", "dir", "lang"],
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "width", "height"],
    "td": ["colspan", "rowspan", "align"],
    "th": ["colspan", "rowspan", "align", "scope"],
    "col": ["span"],
    "colgroup": ["span"],
}

# Properti CSS inline yang diizinkan pada atribut style.
ALLOWED_CSS_PROPERTIES = [
    "color", "background-color", "text-align", "font-size", "font-weight",
    "font-style", "text-decoration", "margin", "padding", "border",
    "border-radius", "width", "height", "direction", "line-height",
]

# Skema URL yang diizinkan (mencegah javascript: dan data: berbahaya).
ALLOWED_PROTOCOLS = ["http", "https", "mailto"]

_css_sanitizer = bleach.css_sanitizer.CSSSanitizer(
    allowed_css_properties=ALLOWED_CSS_PROPERTIES
)


def sanitize_html(raw_html: str) -> str:
    """Kembalikan HTML yang sudah dibersihkan dari elemen berbahaya."""
    if not raw_html:
        return ""
    cleaned = bleach.clean(
        raw_html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        css_sanitizer=_css_sanitizer,
        strip=True,
    )
    return cleaned
