# Abdullah Naveed — Portfolio

A minimal, dependency-free academic portfolio designed for GitHub Pages.

## Structure

- `index.html` — profile overview, recent work, education, experience, and skills
- `publications/` — image-led publication archive
- `projects/` — filterable, image-led project archive
- `experience/` — research, teaching, and academic service history
- `cv/` — HTML curriculum vitae with embedded and downloadable PDF
- `assets/` — shared styles, JavaScript, images, and CV document
- `old-website/` — complete backup of the previous portfolio version

The legacy `/education/` URL redirects to the education section on the homepage.

## Local preview

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The site uses plain HTML, CSS, and a small amount of vanilla JavaScript. No build step is required.
