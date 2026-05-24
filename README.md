# publicpulse.com.bd — Public Pulse Agency website

Live site: https://publicpulse.com.bd/
Hosted on: AWS S3 + CloudFront (account `739275468267`, region `ap-southeast-1`)
GitHub: https://github.com/The-Public-Pulse-Agency/Public-Pulse-Website
Local path: `~/Downloads/Projects/PublicPulse Website/`

## Folder layout

```
PublicPulse Website/
├── site/          # current deployed static files (mirror of the S3 bucket)
├── preview.sh     # run a local server at http://localhost:8080
├── deploy.sh      # sync ./site -> S3 and invalidate CloudFront
├── pull.sh        # re-mirror from S3 into ./site
└── README.md
```

## Quick start

```bash
# Preview locally
./preview.sh

# Deploy changes (after editing files in ./site)
./deploy.sh --dry-run    # see what would change
./deploy.sh              # actually publish
```

## AWS infrastructure

| Resource              | ID / Name                         |
|-----------------------|-----------------------------------|
| S3 bucket             | `publicpulse.com.bd`              |
| CloudFront dist       | `EFMM4G8ZO6TJX`                   |
| Route 53 hosted zone  | `Z00453651ICNJYNV229CW`           |
| Region                | `ap-southeast-1` (Singapore)      |
| AWS CLI profile       | `eventpulse`                      |

## Current state: built artifact only, no source yet

The `site/` folder is the **compiled output** of a Vite/React SPA pulled from S3. The original React source code is not yet in this repo.

- `site/assets/index-CpBUpK7y.js` (351 KB) is the minified React bundle.
- Every page (`/`, `/about`, `/services`, `/blog/*`, `/contact`) is a static `index.html` stub that loads the same JS bundle; React Router renders the page client-side.
- HTML inside `<div id="root">` is **SEO-only fallback** — actual UI comes from the JS bundle.

### What you CAN edit directly in `site/`

- `<head>` content of any `index.html` — meta tags, Open Graph, structured data, GTM/GA/Pixel IDs.
- Image files (`*.jpg`, `*.png`, favicons, `og-image.jpg`).
- `robots.txt`, `sitemap.xml`.
- SEO fallback content inside `#root` (doesn't change what users see, but affects SEO).

### What you CANNOT edit in `site/`

- Visible page content, layout, components, routing, forms — those live inside the minified JS bundle. To change those, the React source needs to be added to this repo.

## Connectivity check

```bash
aws sts get-caller-identity --profile eventpulse
# should show account 739275468267
```
