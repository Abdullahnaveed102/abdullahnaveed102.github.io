# Abdullah Naveed — Portfolio

A minimal, dependency-free academic portfolio designed for GitHub Pages.

## Structure

- `index.html` — profile and broad research overview, selected publications, recent news, research experience, and education
- `news/` — dated news timeline, grouped by year, with optional category filters
- `publications/` — image-led publication archive and broad current research overview
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

Edit **`assets/data/news.json`**. This is the single source for both the homepage and the full timeline. Keep the source entries in newest-first order for the homepage. The full News page also sorts them newest-to-oldest. Entries with the same month keep their authored order: put later milestones above earlier ones, such as starting the UF Ph.D. above completing the Iowa master's degree and starting the Iowa TAship above joining Iowa. `homeLimit` controls how many appear on the homepage (currently 5; change it to 7 or 8 if preferred).

Each entry needs a unique, stable `id`, a `date`, a `category`, and a short `title`. An optional `description` adds detail on the archive page; an optional `link` points to a publication, event, or post. Use plain text, not HTML, in titles/descriptions. The homepage links each headline to its full timeline entry.

Supported categories:

- `academic` — degrees, exams, and academic milestones (purple graduation cap)
- `research` — accepted papers and research announcements (blue document)
- `professional` — appointments and career milestones (green briefcase)
- `travel` — conference attendance and travel (amber airplane)
- `service` — volunteering, mentoring, and community contributions (rose heart)

Only categories with entries appear in the filter bar. Adding the first service entry automatically makes the Service filter available.

Dates accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Use only the precision you can confirm. Current entries all have confirmed months: proposal examination September 2026; SC26 decisions July 2026; SC25 attendance November 2025; and the SecDev conference milestone October 2023. The undergraduate research collaboration ran from August 2022 through May 2023, and the B.S. degree ran from August 2019 through May 2023. Teaching entries use their start month as the timeline date and give the full semester range in the description. No volunteering details have been assumed. Reorder entries when adding or confirming dates.

Conference month references: [SC26 technical paper notifications](https://sc26.supercomputing.org/program/papers/), [SC25](https://sc25.supercomputing.org/), and [SecDev 2023 schedule](https://secdev.ieee.org/2023/schedule/). The SecDev month records the conference milestone, not a separately verified online-publication date. SRI's official name is [SRI International](https://www.sri.com/about-us/), formerly Stanford Research Institute.

The homepage keeps five recent entries and a compact research-focused reading order. Older/course projects remain on the Projects page. The Publications page's Current Research section describes manuscript-related research directions: LLM inference/adaptation reliability, compiler/runtime resilience, GPU compression, and FPGA hardware. It gives the problem and evaluation focus without unpublished titles, distinctive methods, results, or submission venues. The qualifying-exam news entry has been removed at the author's request.

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

## Updating public document downloads

The website's two-page CV and one-page technical résumé use public-safe LaTeX sources in `scripts/document_sources/`. These are separate from the private working CV and role-specific résumés. Keep their education, appointment, and teaching dates consistent with the HTML pages, and exclude unpublished manuscript names, distinctive methods, and private results.

Rebuild both downloads with Python 3 and `pdflatex` (TeX Live, BasicTeX, or MacTeX):

```bash
python3 scripts/build_documents.py
```

The script compiles in a temporary directory and replaces `assets/documents/Abdullah-Naveed-CV.pdf` and `assets/documents/Abdullah-Naveed-Resume.pdf` only after both documents compile. Render and visually review every page before committing the PDFs together with their source changes. The public SC26 titles link to their official conference records.
