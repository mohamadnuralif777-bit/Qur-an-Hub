import bleach

ALLOWED_TAGS = [
    "a", "abbr", "acronym", "b", "blockquote", "br", "caption", "cite",
    "code", "col", "colgroup", "dd", "del", "dfn", "div", "dl", "dt",
    "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
    "hr", "i", "img", "ins", "kbd", "li", "ol", "p", "pre", "q",
    "s", "samp", "section", "small", "span", "strong", "sub", "sup",
    "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul", "var",
    "article", "aside", "header", "footer", "main", "nav",
]

ALLOWED_ATTRIBUTES = {
    "*": ["class", "id", "style", "dir", "lang"],
    "a": ["href", "title", "rel", "target"],
    "img": ["src", "alt", "title", "width", "height"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan", "scope"],
    "col": ["span"],
    "colgroup": ["span"],
    "blockquote": ["cite"],
    "q": ["cite"],
    "ins": ["cite", "datetime"],
    "del": ["cite", "datetime"],
}

ALLOWED_PROTOCOLS = ["http", "https", "mailto"]


def sanitize_html(html: str) -> str:
    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
        strip_comments=True,
    )


def extract_body_content(html: str) -> str:
    import re
    body_match = re.search(r"<body[^>]*>(.*?)</body>", html, re.DOTALL | re.IGNORECASE)
    if body_match:
        return body_match.group(1).strip()
    return html.strip()
