# Abdullah Naveed — Portfolio

A minimal, dependency-free academic portfolio designed for GitHub Pages.

## Structure

- `index.html` — profile overview, recent news, education, experience, ongoing research, publications, and selected projects
- `news/` — dated news timeline, grouped by year, with optional category filters
- `publications/` — image-led publication archive
- `projects/` — grouped, image-led project archive
- `experience/` — research, teaching, and professional service history
- `cv/` — combined CV and résumé page with an accessible HTML CV and downloadable PDFs
- `assets/` — shared styles, JavaScript, images, and document files
- `old-website/` — complete backup of the previous portfolio version

The legacy `/education/` URL redirects to the education section on the homepage.
The locally cloned reference repositories are ignored and are not part of the deployed website.

## Local preview

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The site uses plain HTML, CSS, and a small amount of vanilla JavaScript. GitHub Pages serves the checked-in HTML directly; no hosting build or additional dependencies are required. News content is generated locally as described below. All entries remain readable when JavaScript is disabled; JavaScript only adds the archive's category filters.

## Adding news and updates

Edit **`assets/data/news.json`**. This is the single source for both the homepage and the full timeline. Keep entries in newest-first order. `homeLimit` controls how many appear on the homepage (currently 5; change it to 7 or 8 if preferred).

Each entry needs a unique, stable `id`, a `date`, a `category`, and a short `title`. An optional `description` adds detail on the archive page; an optional `link` points to a publication, event, or post. Use plain text, not HTML, in titles/descriptions. The homepage links each headline to its full timeline entry.

Supported categories:

- `academic` — degrees, exams, and academic milestones (purple graduation cap)
- `research` — accepted papers and research announcements (blue document)
- `professional` — appointments and career milestones (green briefcase)
- `travel` — conference attendance and travel (amber airplane)
- `service` — volunteering, mentoring, and community contributions (rose heart)

Only categories with entries appear in the filter bar. Adding the first service entry automatically makes the Service filter available.

Dates accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Use only the precision you can confirm. The initial proposal exam, SC26 acceptance, and SC25 attendance entries deliberately show the year only; confirm their months/days before making them more specific. No volunteering details have been assumed. Reorder entries when adding or confirming dates.

Example shape (replace these illustrative values with a confirmed event):

```json
{
  "id": "unique-milestone-slug",
  "date": "2026",
  "category": "research",
  "title": "Short announcement headline",
  "description": "Optional public details for the full timeline.",
  "link": { "url": "/publications/", "label": "View publications" }
}
```

Then regenerate and validate from the repository root:

```bash
python3 scripts/build_news.py
python3 scripts/build_news.py --check
python3 -m unittest discover -s tests
```

The generator changes **only** the `NEWS:START` / `NEWS:END` blocks in `index.html` and `news/index.html`. Do not edit those generated blocks by hand. Commit the JSON and both generated HTML files together, along with the feature files on the initial commit. No auto-publishing or changes to the other page content are performed.

Keep unpublished manuscript details, private documents, and unconfirmed events out of this public data file. To announce a future event, explicitly use future-tense wording instead of implying it already happened.
