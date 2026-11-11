# DV Engineering Portfolio

A premium, bilingual (Portuguese/English), accessibility-aware, zero-dependency static portfolio built for Cloudflare Pages. No framework or server runtime is needed. Source content is separate from the design.

## What is included

- Portuguese homepage (`/`) and English version (`/en/`), both statically rendered for indexing.
- Engineering philosophy, architecture illustration, verified public project links, consulting case studies, work history, GitHub activity, contact section.
- Project category filters, mobile navigation, progressive enhancements and reduced-motion support.
- Automated, read-only public GitHub activity collection. The snapshot is built server-side by GitHub Actions; no API credentials reach visitors.
- Cloudflare Pages-compatible security headers, robots.txt and SVG favicon.

## Run locally

Requires Node.js 20+ and Python 3 for preview; no `npm install` is necessary.

```bash
npm run build
npm run test
npm run preview
```

Open `http://localhost:4173` and `http://localhost:4173/en/`.

To generate the initial public activity snapshot (network access required):

```bash
npm run sync:github
npm run build
```

Public GitHub events are a *limited window* (currently up to 30 days / 300 events), not full work history. The commit timeline covers the project's four selected public repositories only. For privacy and accuracy, don't characterize that chart as total work or contributions. The daily GitHub Actions workflow updates the snapshot and commits the result when changed. On GitHub, repository Settings > Actions > General must allow workflow write permissions to push the snapshot. The first sync can be started manually with Actions > Refresh public GitHub activity > Run workflow.

## Customize

1. `content/site.json`: all translated website copy, site identity, email and LinkedIn URL. `identity.email` and `identity.linkedinUrl` are blank until the owner supplies real contact details.
2. `content/projects.json`: portfolio projects, descriptions, stack tags, repository URLs.
3. `src/main.css`: design system and responsive styles.
4. `src/main.js`: filters, activity graph and navigation.
5. `scripts/build.mjs`: static HTML templates and structure.

Add new projects to JSON. In `scripts/build.mjs`, change the displayed denominator `04` if changing project count, or make it dynamic. Refresh the GitHub snapshot after editing projects.

## Free Cloudflare Pages deployment

1. Create a new GitHub repository and push this project. Do not commit secrets.
2. In Cloudflare > Workers & Pages > Create application > Pages > Import an existing Git repository, choose that repo.
3. Choose production branch `main`, framework preset `None`.
4. Set build command to `npm run build` and build output directory to `dist`.
5. Deploy. The site will be served over HTTPS on a free `*.pages.dev` subdomain.
6. Run the GitHub Action once to create the initial data snapshot. Subsequent pushes refresh the site.

Do not add a canonical URL pointing to `example.pages.dev`; configure the final hostname in `scripts/build.mjs` if needed. Currently, no canonical meta tag is emitted.

## Notes on claims and compliance

Consulting projects deliberately omit client names, confidential source and unverifiable business metrics. Update the public case studies only with details you have permission to disclose. Review professional role descriptions before publishing.
