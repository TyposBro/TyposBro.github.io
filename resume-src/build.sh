#!/usr/bin/env bash
# Regenerate the resume PDFs in public/ from the HTML sources here.
# Requires google-chrome or chromium.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME=$(command -v google-chrome || command -v google-chrome-stable || command -v chromium)
for role in android backend frontend; do
  "$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="public/resume-$role.pdf" "file://$PWD/resume-src/$role.html"
  pages=$(pdfinfo "public/resume-$role.pdf" | awk '/^Pages/{print $2}')
  echo "  resume-$role.pdf: ${pages} page(s)"
  [ "$pages" = "1" ] || { echo "  WARNING: $role is no longer one page"; }
done
