"""Dependency-free tests: python3 -m unittest discover -s tests -v"""

from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("build_news", ROOT / "scripts/build_news.py")
news = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(news)


# Fixed synthetic content keeps renderer tests independent of future news edits.
# Actual site data is validated separately by LiveNewsTests below.
SAMPLE_DATA = {
    "homeLimit": 5,
    "entries": [
        {"id": "phd-proposal-exam", "date": "2026", "category": "academic", "title": "Academic milestone"},
        {"id": "sc26-paper-acceptances", "date": "2026", "category": "research", "title": "Research milestone"},
        {"id": "sc25-st-louis", "date": "2025", "category": "travel", "title": "Conference visit"},
        {"id": "iowa-masters-graduation", "date": "2025-08", "category": "academic", "title": "Graduation"},
        {"id": "joined-uf-research", "date": "2025-08", "category": "professional", "title": "New research role"},
        {"id": "joined-argonne", "date": "2025-06", "category": "professional", "title": "New collaboration"},
        {"id": "lums-graduation", "date": "2023-05", "category": "academic", "title": "Earlier graduation"},
    ],
}


class NewsTests(unittest.TestCase):
    def setUp(self):
        self.data = deepcopy(SAMPLE_DATA)

    def test_sample_data_preserves_date_precision(self):
        by_id = {entry["id"]: entry for entry in self.data["entries"]}
        self.assertEqual(by_id["phd-proposal-exam"]["date"], "2026")
        self.assertEqual(by_id["sc26-paper-acceptances"]["date"], "2026")
        self.assertEqual(by_id["sc25-st-louis"]["date"], "2025")
        self.assertEqual(by_id["iowa-masters-graduation"]["date"], "2025-08")
        self.assertNotIn("service", [entry["category"] for entry in self.data["entries"]])

    def test_date_formatting(self):
        self.assertEqual(news.display_date("2026"), "2026")
        self.assertEqual(news.display_date("2026-09"), "Sep 2026")
        self.assertEqual(news.display_date("2024-02-29"), "Feb 29, 2024")

    def test_date_markup_does_not_manufacture_precision(self):
        self.assertEqual(news.time_element("2026"), '<span class="news-date">2026</span>')
        self.assertEqual(news.time_element("2026-09"), '<time class="news-date" datetime="2026-09">Sep 2026</time>')
        self.assertEqual(news.time_element("2026-09-27"), '<time class="news-date" datetime="2026-09-27">Sep 27, 2026</time>')
        self.assertNotIn('datetime="2026"', news.render_home(self.data))
        self.assertNotIn('datetime="2025"', news.render_archive(self.data))

    def test_invalid_dates_are_rejected(self):
        for value in (None, 2026, "2026-2", "2026-13", "2026-00", "2026-02-29", "0000", "2026-04-31", "2026-01-01T12:00"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                news.validate_date(value)

    def test_home_limit_and_archive_completeness(self):
        home = news.render_home(self.data)
        archive = news.render_archive(self.data)
        self.assertEqual(home.count('data-news-id="'), 5)
        self.assertEqual(archive.count('data-news-id="'), len(self.data["entries"]))
        self.assertEqual(archive.count('data-news-year="'), 3)
        for entry in self.data["entries"][:5]:
            self.assertIn(f'href="/news/#{entry["id"]}"', home)
            self.assertIn(f'id="{entry["id"]}"', archive)
        self.assertNotIn('data-news-id="joined-argonne"', home)
        changed = deepcopy(self.data)
        changed["homeLimit"] = 7
        self.assertEqual(news.render_home(changed).count('data-news-id="'), 7)

    def test_new_service_events_and_changed_limits_are_supported(self):
        changed = deepcopy(self.data)
        changed["entries"].insert(0, {
            "id": "conference-volunteering",
            "date": "2027-03",
            "category": "service",
            "title": "Volunteered at a conference",
        })
        changed["homeLimit"] = 3
        news.validate_data(changed)
        self.assertEqual(news.render_home(changed).count('data-news-id="'), 3)
        self.assertIn('data-news-category="service"', news.render_archive(changed))
        self.assertIn('datetime="2027-03"', news.render_archive(changed))

    def test_same_year_input_order_is_kept(self):
        changed = deepcopy(self.data)
        changed["entries"][0], changed["entries"][1] = changed["entries"][1], changed["entries"][0]
        output = news.render_archive(changed)
        self.assertLess(output.index('id="sc26-paper-acceptances"'), output.index('id="phd-proposal-exam"'))

    def test_archive_is_newest_first_and_keeps_same_month_milestones_in_order(self):
        story = {
            "homeLimit": 2,
            "entries": [
                {"id": "paper", "date": "2025-10", "category": "research", "title": "Paper accepted"},
                {"id": "teaching-start", "date": "2023-08", "category": "professional", "title": "Started teaching"},
                {"id": "joined-graduate-school", "date": "2023-08", "category": "academic", "title": "Joined graduate school"},
                {"id": "bachelors-completed", "date": "2023-05", "category": "academic", "title": "Completed bachelor's degree"},
            ],
        }
        archive = news.render_archive(story)
        self.assertLess(archive.index('id="paper"'), archive.index('id="teaching-start"'))
        self.assertLess(archive.index('id="teaching-start"'), archive.index('id="joined-graduate-school"'))
        self.assertLess(archive.index('id="joined-graduate-school"'), archive.index('id="bachelors-completed"'))
        home = news.render_home(story)
        self.assertLess(home.index('data-news-id="paper"'), home.index('data-news-id="teaching-start"'))
        self.assertNotIn('data-news-id="bachelors-completed"', home)

    def test_plain_text_is_escaped(self):
        changed = deepcopy(self.data)
        changed["entries"][0]["title"] = '<script>alert("title")</script>'
        changed["entries"][0]["description"] = '<img src=x onerror="alert(1)"> & research'
        changed["entries"][0]["link"] = {"url": "/news/?a=1&b=2", "label": '<b>More</b>'}
        for render in (news.render_home, news.render_archive):
            output = render(changed)
            self.assertNotIn("<script>", output)
            self.assertIn("&lt;script&gt;", output)
        archive = news.render_archive(changed)
        self.assertNotIn("<img", archive)
        self.assertIn("&lt;img", archive)
        self.assertIn('href="/news/?a=1&amp;b=2"', archive)
        self.assertIn("&lt;b&gt;More&lt;/b&gt;", archive)

    def test_unsafe_urls_are_rejected(self):
        for url in ("javascript:alert(1)", "//example.com", "https://a@evil.test", "https://x.test:abc", "http://", "news/", "\\evil.test", "/\\evil.test", " https://example.com", "https://example.com\n", "data:text/html,hello", "/news/\t"):
            with self.subTest(url=url), self.assertRaises(ValueError):
                news.validate_url(url)
        for url in ("/news/", "/news/#proposal", "https://example.com/path?x=1&y=2", "http://localhost:8000/news/"):
            self.assertEqual(news.validate_url(url), url)

    def test_invalid_records_are_rejected(self):
        mutations = [
            lambda data: data.update(homeLimit=0),
            lambda data: data.update(homeLimit=True),
            lambda data: data.update(homeLimit=1.5),
            lambda data: data.update(entries={}),
            lambda data: data["entries"][0].update(id="<unsafe>"),
            lambda data: data["entries"][0].update(id="news-year-2026"),
            lambda data: data["entries"][0].update(id=data["entries"][1]["id"]),
            lambda data: data["entries"][0].update(category="unknown"),
            lambda data: data["entries"][0].update(category=[]),
            lambda data: data["entries"][0].update(title=""),
            lambda data: data["entries"][0].update(description=None),
            lambda data: data["entries"][0].update(link={"url": "/news/"}),
            lambda data: data["entries"][1].update(date="2027"),
        ]
        for mutation in mutations:
            changed = deepcopy(self.data)
            mutation(changed)
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                news.validate_data(changed)

    def test_empty_data_has_a_readable_fallback(self):
        empty = {"homeLimit": 5, "entries": []}
        self.assertIn("Updates will be added", news.render_home(empty))
        self.assertIn("Updates will be added", news.render_archive(empty))

    def test_all_categories_have_decorative_inline_icons(self):
        for category in news.CATEGORIES:
            with self.subTest(category=category):
                self.assertIn('aria-hidden="true"', news.icon(category))
                self.assertIn('<svg ', news.icon(category))

    def test_marker_replacement_preserves_everything_else(self):
        before = '<!doctype html>\n<p>Existing &amp; content</p>\n    <!-- NEWS:START -->'
        after = '    <!-- NEWS:END -->\n<section id="education">Unchanged</section>\n'
        original = before + '\n    <p>Old news</p>\n' + after
        output = news.replace_block(original, '<ol>\n  <li>New</li>\n</ol>')
        self.assertTrue(output.startswith(before + '\n'))
        self.assertTrue(output.endswith(after))
        self.assertIn('    <ol>\n      <li>New</li>\n    </ol>', output)
        self.assertNotIn('Old news', output)
        self.assertEqual(news.replace_block(output, '<ol>\n  <li>New</li>\n</ol>'), output)

    def test_invalid_markers_are_rejected(self):
        for html in (
            '<p>No markers</p>',
            '<!-- NEWS:END -->\n<!-- NEWS:START -->',
            '<!-- NEWS:START --><!-- NEWS:END -->',
            '<!-- NEWS:START -->\n<!-- NEWS:START -->\n<!-- NEWS:END -->',
        ):
            with self.subTest(html=html), self.assertRaises(ValueError):
                news.replace_block(html, '<p>Content</p>')

    def test_crlf_content_outside_markers_is_preserved(self):
        before = '<!doctype html>\r\n<p>Keep this</p>\r\n    <!-- NEWS:START -->'
        after = '    <!-- NEWS:END -->\r\n<footer>Keep this too</footer>\r\n'
        original = before + '\r\n    <p>Old</p>\r\n' + after
        output = news.replace_block(original, '<ol>\n  <li>New</li>\n</ol>')
        self.assertEqual(output, before + '\r\n    <ol>\r\n      <li>New</li>\r\n    </ol>\r\n' + after)

    def test_build_and_check_modes(self):
        with tempfile.TemporaryDirectory(prefix="portfolio-news-test-") as directory:
            root = Path(directory)
            (root / "assets/data").mkdir(parents=True)
            (root / "news").mkdir()
            (root / "assets/data/news.json").write_text(json.dumps(self.data), encoding="utf-8")
            shell = '<!doctype html>\n<!-- NEWS:START -->\n<!-- NEWS:END -->\n<footer>Unchanged</footer>\n'
            for path in (root / "index.html", root / "news/index.html"):
                path.write_text(shell, encoding="utf-8")
            self.assertEqual(news.build(root, check=True), ["index.html", "news/index.html"])
            self.assertEqual((root / "index.html").read_text(encoding="utf-8"), shell)
            self.assertEqual(news.build(root), ["index.html", "news/index.html"])
            self.assertEqual(news.build(root, check=True), [])
            self.assertEqual(news.build(root), [])
            self.assertIn('data-news-year="2026"', (root / "news/index.html").read_text(encoding="utf-8"))

    def test_broken_archive_does_not_partially_write_home(self):
        with tempfile.TemporaryDirectory(prefix="portfolio-news-test-") as directory:
            root = Path(directory)
            (root / "assets/data").mkdir(parents=True)
            (root / "news").mkdir()
            (root / "assets/data/news.json").write_text(json.dumps(self.data), encoding="utf-8")
            home = '<!-- NEWS:START -->\n<!-- NEWS:END -->\n'
            (root / "index.html").write_text(home, encoding="utf-8")
            (root / "news/index.html").write_text("Missing markers", encoding="utf-8")
            with self.assertRaises(ValueError):
                news.build(root)
            self.assertEqual((root / "index.html").read_text(encoding="utf-8"), home)


class LiveNewsTests(unittest.TestCase):
    def test_site_data_is_valid_without_prescribing_content(self):
        # Adding events, dates, categories, or changing homeLimit is permitted.
        news.read_data(ROOT / "assets/data/news.json")

    def test_site_html_matches_current_data(self):
        # Content changes only require the documented regeneration command.
        self.assertEqual(news.build(ROOT, check=True), [])


if __name__ == "__main__":
    unittest.main()
