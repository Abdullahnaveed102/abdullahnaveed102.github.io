#!/usr/bin/env python3
"""Render one news data file into the portfolio's static HTML pages.

Run from any directory: python3 scripts/build_news.py
Use --check to verify the committed HTML without changing files.
Both the homepage and archive read newest to oldest, preserving the authored
order for entries with the same date.
Year-only dates remain year-only.
"""

import argparse
from datetime import date
from html import escape
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
START_MARKER = "<!-- NEWS:START -->"
END_MARKER = "<!-- NEWS:END -->"
CATEGORIES = {
    "academic": "Academic",
    "research": "Research",
    "professional": "Professional",
    "travel": "Travel & Conferences",
    "service": "Service",
}
MONTHS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
ICONS = {
    "academic": '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v6c4 3 8 3 12 0v-6M22 9v7"/>',
    "research": '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    "professional": '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12c5 3 13 3 18 0M12 12v4"/>',
    "travel": '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
    "service": '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
}


def validate_date(value):
    """Accept a real year, month, or day without manufacturing precision."""
    if not isinstance(value, str) or not re.fullmatch(r"[0-9]{4}(?:-[0-9]{2}){0,2}", value):
        raise ValueError("date must use YYYY, YYYY-MM, or YYYY-MM-DD")
    parts = [int(part) for part in value.split("-")]
    try:
        date(parts[0], parts[1] if len(parts) > 1 else 1, parts[2] if len(parts) > 2 else 1)
    except ValueError as error:
        raise ValueError(f"Invalid calendar date: {value}") from error
    return value


def display_date(value):
    validate_date(value)
    parts = value.split("-")
    if len(parts) == 1:
        return value
    month = MONTHS[int(parts[1]) - 1]
    if len(parts) == 2:
        return f"{month} {parts[0]}"
    return f"{month} {int(parts[2])}, {parts[0]}"


def validate_url(value):
    if not isinstance(value, str) or not value or any(ord(char) <= 32 or ord(char) == 127 for char in value):
        raise ValueError("Link URL must be a nonempty URL without whitespace or control characters")
    if "\\" in value:
        raise ValueError("Backslashes are not allowed in link URLs")
    try:
        parsed = urlsplit(value)
        if parsed.username is not None or parsed.password is not None:
            raise ValueError("Credentials are not allowed in link URLs")
        if value.startswith("/") and not value.startswith("//") and not parsed.netloc and not parsed.scheme:
            return value
        if parsed.scheme in ("http", "https") and parsed.netloc and parsed.hostname:
            parsed.port  # Validate ports instead of emitting a malformed link.
            return value
    except ValueError as error:
        raise ValueError(f"Invalid link URL: {value}") from error
    raise ValueError("Links must be root-relative paths or http(s) URLs")


def required_text(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a nonempty string")
    return value


def validate_data(data):
    if not isinstance(data, dict):
        raise ValueError("News data must be an object")
    limit = data.get("homeLimit")
    if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
        raise ValueError("homeLimit must be a positive integer")
    entries = data.get("entries")
    if not isinstance(entries, list):
        raise ValueError("entries must be an array")
    ids = set()
    previous_year = 10000
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Every news entry must be an object")
        entry_id = entry.get("id")
        if not isinstance(entry_id, str) or not re.fullmatch(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", entry_id):
            raise ValueError("Entry ids must be lowercase hyphen-separated words beginning with a letter")
        if entry_id in {"main", "news", "news-archive"} or entry_id.startswith("news-year-"):
            raise ValueError(f"Entry id is reserved for the page layout: {entry_id}")
        if entry_id in ids:
            raise ValueError(f"Duplicate news id: {entry_id}")
        ids.add(entry_id)
        validate_date(entry.get("date"))
        year = int(entry["date"][:4])
        if year > previous_year:
            raise ValueError("Keep news entries newest first, with years in descending order")
        previous_year = year
        if not isinstance(entry.get("category"), str) or entry["category"] not in CATEGORIES:
            raise ValueError(f"Unknown category for {entry_id}")
        required_text(entry.get("title"), "title")
        if "description" in entry:
            required_text(entry["description"], "description")
        if "link" in entry:
            link = entry["link"]
            if not isinstance(link, dict):
                raise ValueError("link must be an object containing url and label")
            validate_url(link.get("url"))
            required_text(link.get("label"), "link label")
    return data


def read_data(path):
    return validate_data(json.loads(Path(path).read_text(encoding="utf-8")))


def icon(category):
    return (
        '<span class="news-icon" aria-hidden="true">'
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
        'stroke-linecap="round" stroke-linejoin="round" focusable="false">'
        f'{ICONS[category]}</svg></span>'
    )


def time_element(value):
    label = display_date(value)
    if len(value) == 4:
        return f'<span class="news-date">{label}</span>'
    return f'<time class="news-date" datetime="{escape(value, quote=True)}">{label}</time>'


def render_home(data):
    validate_data(data)
    if not data["entries"]:
        return '<p class="news-empty">Updates will be added here soon.</p>'
    lines = ['<ol class="news-preview">']
    for entry in data["entries"][:data["homeLimit"]]:
        lines.extend([
            f'  <li class="news-preview-item news-category--{entry["category"]}" data-news-id="{entry["id"]}">',
            f'    {time_element(entry["date"])}',
            f'    {icon(entry["category"])}',
            f'    <div class="news-preview-copy"><a class="news-preview-title" href="/news/#{entry["id"]}">{escape(entry["title"])}</a></div>',
            '  </li>',
        ])
    lines.append('</ol>')
    return "\n".join(lines)


def render_archive(data):
    validate_data(data)
    if not data["entries"]:
        return '<p class="news-empty">Updates will be added here soon.</p>'
    lines = []
    current_year = None
    # Stable sorting preserves the intended sequence within a month, such as
    # enrolling at a university before starting a teaching appointment there.
    for entry in sorted(data["entries"], key=lambda entry: entry["date"], reverse=True):
        year = entry["date"][:4]
        if year != current_year:
            if current_year is not None:
                lines.extend(['  </ol>', '</section>'])
            lines.extend([
                f'<section class="news-year" data-news-year="{year}" aria-labelledby="news-year-{year}">',
                f'  <h2 id="news-year-{year}">{year}</h2>',
                '  <ol class="news-timeline">',
            ])
            current_year = year
        category = entry["category"]
        lines.extend([
            f'    <li id="{entry["id"]}" class="news-entry news-category--{category}" data-news-category="{category}" data-news-id="{entry["id"]}">',
            f'      {icon(category)}',
            '      <div class="news-entry-copy">',
            f'        <div class="news-entry-meta">{time_element(entry["date"])}<span class="news-category-label">{escape(CATEGORIES[category])}</span></div>',
            f'        <h3>{escape(entry["title"])}</h3>',
        ])
        if entry.get("description"):
            lines.append(f'        <p>{escape(entry["description"])}</p>')
        if entry.get("link"):
            link = entry["link"]
            lines.append(f'        <a class="news-entry-link" href="{escape(link["url"], quote=True)}">{escape(link["label"])}</a>')
        lines.extend(['      </div>', '    </li>'])
    lines.extend(['  </ol>', '</section>'])
    return "\n".join(lines)


def replace_block(html, content):
    if html.count(START_MARKER) != 1 or html.count(END_MARKER) != 1:
        raise ValueError("Each page must contain exactly one NEWS:START / NEWS:END marker pair")
    start = re.search(r"(?m)^([ \t]*)" + re.escape(START_MARKER) + r"[ \t]*(?=\r?$)", html)
    end = re.search(r"(?m)^([ \t]*)" + re.escape(END_MARKER) + r"[ \t]*(?=\r?$)", html)
    if start is None or end is None or start.end() >= end.start():
        raise ValueError("News markers must be on separate lines in start/end order")
    indent = start.group(1)
    newline = "\r\n" if html[start.end():].startswith("\r\n") else "\n"
    body = newline.join(indent + line if line else "" for line in content.splitlines())
    return html[:start.end()] + newline + body + newline + html[end.start():]


def build(root=ROOT, check=False):
    root = Path(root)
    data = read_data(root / "assets/data/news.json")
    # Validate and render both documents before writing either one.
    rendered = []
    for relative, content in (("index.html", render_home(data)), ("news/index.html", render_archive(data))):
        path = root / relative
        original = path.read_bytes().decode("utf-8")
        rendered.append((path, original, replace_block(original, content)))
    stale = [path.relative_to(root).as_posix() for path, original, output in rendered if original != output]
    if not check:
        for path, original, output in rendered:
            if original != output:
                path.write_bytes(output.encode("utf-8"))
    return stale


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check for stale generated HTML without editing files")
    args = parser.parse_args(argv)
    try:
        stale = build(check=args.check)
    except (OSError, ValueError) as error:
        print(f"News build failed: {error}", file=sys.stderr)
        return 1
    if args.check and stale:
        print("News HTML is out of date: " + ", ".join(stale), file=sys.stderr)
        print("Run python3 scripts/build_news.py before committing.", file=sys.stderr)
        return 1
    if args.check:
        print("News HTML is up to date.")
    else:
        print("Updated " + ", ".join(stale) if stale else "News HTML is already up to date.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
