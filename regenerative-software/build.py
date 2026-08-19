#!/usr/bin/env python3
"""Static site generator for The Phoenix Architecture.

Pulls site.standard.* records straight from the ATProto PDS (the same data
Leaflet renders) and emits a static HTML site into the chad.github.io repo
under /regenerative-software.

Usage: python3 build.py
"""
import html
import json
import os
import shutil
import urllib.request

DID = "did:plc:4qsyxmnsblo4luuycm3572bq"
PDS = "https://puffball.us-east.host.bsky.network"
PUB_RKEY = "3majnsnvafs2b"  # The Phoenix Architecture
PUB_URI = f"at://{DID}/site.standard.publication/{PUB_RKEY}"

BASE = "/regenerative-software"
OUT = os.path.expanduser("~/src/chad.github.io") + BASE
BLOBS = os.path.join(OUT, "blobs")


def fetch_json(url):
    with urllib.request.urlopen(url) as r:
        return json.load(r)


def fetch_blob(cid, mime):
    ext = {"image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png",
           "image/gif": ".gif"}.get(mime, "")
    name = cid + ext
    path = os.path.join(BLOBS, name)
    if not os.path.exists(path):
        url = f"{PDS}/xrpc/com.atproto.sync.getBlob?did={DID}&cid={cid}"
        with urllib.request.urlopen(url) as r, open(path, "wb") as f:
            shutil.copyfileobj(r, f)
    return f"{BASE}/blobs/{name}"


def apply_facets(text, facets):
    """Render plaintext + leaflet richtext facets to HTML (byte offsets)."""
    b = text.encode("utf-8")
    if not facets:
        return html.escape(text)
    # events: (pos, order, open/close tags)
    spans = []
    for f in facets:
        start, end = f["index"]["byteStart"], f["index"]["byteEnd"]
        opens, closes = "", ""
        for feat in f.get("features", []):
            t = feat["$type"].split("#")[-1]
            if t == "bold":
                opens += "<strong>"; closes = "</strong>" + closes
            elif t == "italic":
                opens += "<em>"; closes = "</em>" + closes
            elif t == "code":
                opens += "<code>"; closes = "</code>" + closes
            elif t == "link":
                opens += f'<a href="{html.escape(feat.get("uri", "#"), quote=True)}">'
                closes = "</a>" + closes
            elif t == "strikethrough":
                opens += "<s>"; closes = "</s>" + closes
            elif t == "underline":
                opens += "<u>"; closes = "</u>" + closes
        spans.append((start, end, opens, closes))
    spans.sort(key=lambda s: s[0])
    out, pos = [], 0
    for start, end, opens, closes in spans:
        if start < pos:  # overlapping facet; skip formatting, keep text intact
            continue
        out.append(html.escape(b[pos:start].decode("utf-8", "replace")))
        out.append(opens)
        out.append(html.escape(b[start:end].decode("utf-8", "replace")))
        out.append(closes)
        pos = end
    out.append(html.escape(b[pos:].decode("utf-8", "replace")))
    return "".join(out)


def render_block(block):
    t = block["$type"]
    if t == "pub.leaflet.blocks.text":
        return f'<p>{apply_facets(block.get("plaintext", ""), block.get("facets"))}</p>'
    if t == "pub.leaflet.blocks.header":
        lvl = min(max(int(block.get("level", 2)) + 1, 2), 6)  # h1 reserved for title
        return f'<h{lvl}>{apply_facets(block.get("plaintext", ""), block.get("facets"))}</h{lvl}>'
    if t == "pub.leaflet.blocks.blockquote":
        return f'<blockquote><p>{apply_facets(block.get("plaintext", ""), block.get("facets"))}</p></blockquote>'
    if t == "pub.leaflet.blocks.code":
        lang = html.escape(block.get("language", ""), quote=True)
        return (f'<pre><code class="language-{lang}">'
                f'{html.escape(block.get("plaintext", ""))}</code></pre>')
    if t == "pub.leaflet.blocks.horizontalRule":
        return "<hr>"
    if t == "pub.leaflet.blocks.image":
        img = block["image"]
        src = fetch_blob(img["ref"]["$link"], img.get("mimeType", ""))
        alt = html.escape(block.get("alt", ""), quote=True)
        ar = block.get("aspectRatio")
        dims = f' width="{ar["width"]}" height="{ar["height"]}"' if ar else ""
        return f'<figure><img src="{src}" alt="{alt}" loading="lazy"{dims}></figure>'
    if t == "pub.leaflet.blocks.unorderedList":
        items = "".join(
            f'<li>{render_block(li["content"])[3:-4] if li["content"]["$type"] == "pub.leaflet.blocks.text" else render_block(li["content"])}</li>'
            for li in block.get("children", []))
        return f"<ul>{items}</ul>"
    if t == "pub.leaflet.blocks.orderedList":
        items = "".join(
            f'<li>{render_block(li["content"])[3:-4] if li["content"]["$type"] == "pub.leaflet.blocks.text" else render_block(li["content"])}</li>'
            for li in block.get("children", []))
        return f"<ol>{items}</ol>"
    # Unknown block: preserve plaintext if present
    if "plaintext" in block:
        return f'<p>{html.escape(block["plaintext"])}</p>'
    return f"<!-- unsupported block {html.escape(t)} -->"


def render_doc_body(doc):
    parts = []
    for page in doc["content"]["pages"]:
        for wrapper in page.get("blocks", []):
            parts.append(render_block(wrapper["block"]))
    return "\n".join(parts)


CSS = """
:root {
  --bg: rgb(253, 252, 250);
  --fg: rgb(39, 39, 39);
  --accent: rgb(233, 79, 55);
  --accent-fg: rgb(255, 255, 255);
  --muted: rgb(120, 117, 110);
  --rule: rgba(39, 39, 39, 0.12);
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--fg);
  font: 18px/1.65 Georgia, 'Times New Roman', serif;
}
header.site {
  padding: 3rem 1rem 2rem; text-align: center;
  border-bottom: 1px solid var(--rule);
}
header.site img.icon { width: 72px; height: 72px; border-radius: 12px; }
header.site h1 { margin: 0.75rem 0 0.5rem; font-size: 1.9rem; }
header.site h1 a { color: var(--fg); text-decoration: none; }
header.site p.desc {
  max-width: 38rem; margin: 0 auto; color: var(--muted); font-size: 0.95rem;
}
main { max-width: 40rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
a { color: var(--accent); }
h1, h2, h3, h4 { line-height: 1.25; font-family: Georgia, serif; }
article h1.title { font-size: 2.1rem; margin-bottom: 0.25rem; }
p.meta { color: var(--muted); font-size: 0.85rem; margin-top: 0; }
p.tags { color: var(--muted); font-size: 0.85rem; }
blockquote {
  margin: 1.5rem 0; padding: 0.25rem 1.25rem; border-left: 3px solid var(--accent);
  color: rgb(70, 68, 64); font-style: italic;
}
pre {
  background: rgb(245, 243, 238); border: 1px solid var(--rule); border-radius: 8px;
  padding: 1rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.5;
}
code { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 0.9em; }
p code { background: rgb(245, 243, 238); padding: 0.1em 0.35em; border-radius: 4px; }
figure { margin: 2rem 0; }
figure img { max-width: 100%; height: auto; border-radius: 8px; }
hr { border: none; border-top: 1px solid var(--rule); margin: 2.5rem auto; width: 40%; }
ul.postlist { list-style: none; padding: 0; }
ul.postlist li { margin: 0 0 1.75rem; }
ul.postlist a.t { font-size: 1.25rem; text-decoration: none; }
ul.postlist a.t:hover { text-decoration: underline; }
ul.postlist .d { color: var(--muted); font-size: 0.85rem; display: block; }
nav.prevnext {
  display: flex; justify-content: space-between; gap: 1rem;
  margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--rule);
  font-size: 0.9rem;
}
nav.prevnext span { max-width: 45%; }
footer.site {
  text-align: center; color: var(--muted); font-size: 0.8rem;
  padding: 2rem 1rem 3rem; border-top: 1px solid var(--rule);
}
"""


def page(title, body, pub, desc=None, icon_href=None):
    desc_tag = f'<meta name="description" content="{html.escape(desc, quote=True)}">' if desc else ""
    icon_tag = f'<link rel="icon" href="{icon_href}">' if icon_href else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
{desc_tag}
{icon_tag}
<link rel="stylesheet" href="{BASE}/style.css">
</head>
<body>
<header class="site">
  {f'<a href="{BASE}/"><img class="icon" src="{icon_href}" alt=""></a>' if icon_href else ''}
  <h1><a href="{BASE}/">{html.escape(pub["name"])}</a></h1>
  <p class="desc">{html.escape(pub.get("description", ""))}</p>
</header>
<main>
{body}
</main>
<footer class="site">
  <p>{html.escape(pub["name"])} &middot; written by <a href="https://bsky.app/profile/chadfowler.com">@chadfowler.com</a></p>
  <p>Published on the <a href="https://atproto.com">AT Protocol</a> &middot; also at <a href="https://aicoding.leaflet.pub">aicoding.leaflet.pub</a></p>
  <p><a href="/">chadfowler.com</a></p>
</footer>
</body>
</html>"""


def fmt_date(iso):
    from datetime import datetime
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).strftime("%B %-d, %Y")
    except Exception:
        return iso[:10]


def main():
    os.makedirs(BLOBS, exist_ok=True)

    pub = fetch_json(f"{PDS}/xrpc/com.atproto.repo.getRecord?repo={DID}"
                     f"&collection=site.standard.publication&rkey={PUB_RKEY}")["value"]

    records, cursor = [], None
    while True:
        url = (f"{PDS}/xrpc/com.atproto.repo.listRecords?repo={DID}"
               f"&collection=site.standard.document&limit=100")
        if cursor:
            url += f"&cursor={cursor}"
        d = fetch_json(url)
        records += d["records"]
        cursor = d.get("cursor")
        if not cursor or not d["records"]:
            break

    docs = [r["value"] for r in records if r["value"].get("site") == PUB_URI]
    docs.sort(key=lambda v: v.get("publishedAt", ""), reverse=True)

    icon_href = None
    if pub.get("icon"):
        icon_href = fetch_blob(pub["icon"]["ref"]["$link"], pub["icon"].get("mimeType", ""))

    with open(os.path.join(OUT, "style.css"), "w") as f:
        f.write(CSS)

    # Post pages (newest-first list; prev = newer, next = older)
    for i, doc in enumerate(docs):
        title = doc["title"].strip()
        body = [f'<article><h1 class="title">{html.escape(title)}</h1>']
        body.append(f'<p class="meta">{fmt_date(doc.get("publishedAt", ""))}</p>')
        if doc.get("description"):
            pass  # description used in meta tag only
        body.append(render_doc_body(doc))
        if doc.get("tags"):
            body.append('<p class="tags">' + " ".join(html.escape(t) for t in doc["tags"]) + "</p>")
        nav = ['<nav class="prevnext">']
        older = docs[i + 1] if i + 1 < len(docs) else None
        newer = docs[i - 1] if i > 0 else None
        older_link = ('&larr; <a href="%s%s/">%s</a>' % (BASE, older["path"], html.escape(older["title"].strip()))) if older else ""
        newer_link = ('<a href="%s%s/">%s</a> &rarr;' % (BASE, newer["path"], html.escape(newer["title"].strip()))) if newer else ""
        nav.append(f'<span>{older_link}</span>')
        nav.append(f'<span style="text-align:right">{newer_link}</span>')
        nav.append("</nav>")
        body.append("".join(nav))
        body.append("</article>")
        slug = doc["path"].lstrip("/")
        pagedir = os.path.join(OUT, slug)
        os.makedirs(pagedir, exist_ok=True)
        html_out = page(f"{title} — {pub['name']}", "\n".join(body), pub,
                        desc=doc.get("description"), icon_href=icon_href)
        with open(os.path.join(pagedir, "index.html"), "w") as f:
            f.write(html_out)

    # Index
    items = []
    for doc in docs:
        d = fmt_date(doc.get("publishedAt", ""))
        desc = html.escape(doc.get("description", "") or "")
        items.append(f'<li><a class="t" href="{BASE}{doc["path"]}/">{html.escape(doc["title"].strip())}</a>'
                     f'<span class="d">{d}</span>'
                     + (f'<span class="d">{desc}</span>' if desc else "") + "</li>")
    index_body = f'<ul class="postlist">{"".join(items)}</ul>'
    with open(os.path.join(OUT, "index.html"), "w") as f:
        f.write(page(pub["name"], index_body, pub, desc=pub.get("description"),
                     icon_href=icon_href))

    print(f"Built {len(docs)} posts -> {OUT}")


if __name__ == "__main__":
    main()
