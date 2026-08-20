# Abdullah Naveed — Portfolio

A minimal, dependency-free academic portfolio designed for GitHub Pages.

## Structure

- `index.html` — profile overview, education, experience, ongoing research, publications, and selected projects
- `publications/` — image-led publication archive
- `projects/` — grouped, image-led project archive
- `experience/` — research, teaching, and professional service history
- `cv/` — HTML curriculum vitae with embedded and downloadable PDF
- `assets/` — shared styles, JavaScript, images, and CV document
- `old-website/` — complete backup of the previous portfolio version

The legacy `/education/` URL redirects to the education section on the homepage.
The locally cloned reference repositories are ignored and are not part of the deployed website.

## Local preview

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The site uses plain HTML, CSS, and a small amount of vanilla JavaScript. No build step is required.
