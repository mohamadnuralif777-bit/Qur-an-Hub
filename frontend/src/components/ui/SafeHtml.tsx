import DOMPurify from "dompurify";

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export default function SafeHtml({ html, className = "" }: SafeHtmlProps) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a", "b", "blockquote", "br", "caption", "cite", "code", "col",
      "colgroup", "dd", "del", "dfn", "div", "dl", "dt", "em", "figcaption",
      "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins",
      "kbd", "li", "ol", "p", "pre", "q", "s", "samp", "section", "small",
      "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th",
      "thead", "tr", "u", "ul", "var", "article", "aside", "header", "footer",
    ],
    ALLOWED_ATTR: [
      "href", "title", "class", "id", "style", "dir", "lang", "rel",
      "src", "alt", "width", "height", "colspan", "rowspan", "scope", "span",
      "cite", "datetime",
    ],
    FORBID_TAGS: ["script", "iframe", "form", "input", "button", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onmouseout", "onfocus", "onblur"],
  });

  return (
    <div
      className={`prose-islamic ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
