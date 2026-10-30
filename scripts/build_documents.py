#!/usr/bin/env python3
"""Build the public website CV and resume from their sanitized LaTeX sources."""

from pathlib import Path
import os
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[1]
DOCUMENTS = (
    ("cv", "Abdullah-Naveed-CV.pdf"),
    ("resume", "Abdullah-Naveed-Resume.pdf"),
)


def main():
    compiler = shutil.which("pdflatex")
    if compiler is None:
        mac_tex = Path("/Library/TeX/texbin/pdflatex")
        if mac_tex.is_file():
            compiler = str(mac_tex)
    if compiler is None:
        raise SystemExit("pdflatex is required. Install TeX Live or MacTeX first.")

    # Make the generated metadata stable across builds of unchanged sources.
    environment = dict(os.environ)
    environment["SOURCE_DATE_EPOCH"] = "1793232000"  # 2026-10-29 UTC
    environment["FORCE_SOURCE_DATE"] = "1"
    with tempfile.TemporaryDirectory(prefix="portfolio-documents-") as directory:
        build = Path(directory)
        for stem, filename in DOCUMENTS:
            source = ROOT / "scripts" / "document_sources" / f"{stem}.tex"
            for _ in range(2):
                result = subprocess.run(
                    [compiler, "-interaction=nonstopmode", "-halt-on-error",
                     "-file-line-error", f"-output-directory={build}", str(source)],
                    cwd=source.parent, env=environment,
                    capture_output=True, text=True,
                )
                if result.returncode:
                    raise SystemExit(result.stdout + result.stderr)
            log = (build / f"{stem}.log").read_text(errors="replace")
            for line in log.splitlines():
                if "Overfull" in line or "LaTeX Warning:" in line:
                    print(f"{filename}: {line}")

        destination = ROOT / "assets" / "documents"
        destination.mkdir(parents=True, exist_ok=True)
        # Only replace the published files after both documents compile.
        for stem, filename in DOCUMENTS:
            shutil.copyfile(build / f"{stem}.pdf", destination / filename)
            print(f"Built {destination.relative_to(ROOT) / filename}")


if __name__ == "__main__":
    main()
