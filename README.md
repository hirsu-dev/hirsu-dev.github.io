# hirsu — projects, experiments & the workbench

Hrushi's interactive portfolio, published for free at https://hrushikbarani-hub.github.io/. Static HTML, CSS, ES modules, and Canvas 2D. No backend, framework, remote fonts, analytics, API keys, or install step. It does not run on a Raspberry Pi.

## Experience

A curved project wheel, animated branching linework, live ASCII eye, terminal-style project pages, an animated workbench diagram, four persistent palettes, optional worm and ghost companions, enlarged previews, keyboard navigation, and public-source stack statistics. Inspired by the layout and interaction style of [hancore.dev](https://hancore.dev/site/); this site's implementation, graphics, palettes, and personal content are original. No reference-site source or assets are bundled.

- Scroll or drag the desktop wheel; use ↑ / ↓ to browse and Home / End to jump.
- Use ← / → or the image arrows to browse available project screenshots; click a preview to enlarge it.
- On phones, swipe the thumbnail rail or use its arrow buttons.
- Press : to focus the command line. Type help for commands; ↑ / ↓ recall command history.
- Commands include ls, whoami, open maintaineros, stack, themes, workbench, search python, theme amber, status, clear, and motion / eye / worm / ghost [on|off].
- The terminal only operates this portfolio; it never executes shell commands.
- Footer controls pause motion, close the eye, and toggle companions. System reduced-motion preference is respected initially; an explicit toggle overrides it. Animations pause while the tab is hidden.
- Page hashes are shareable and browser back/forward works. Old project- hashes remain supported.

## Edit and verify

Project descriptions, status, images, provenance, and source links live in projects.js. Terminal pages and navigation are in app.js. Motion is in motion.js; styles are in styles.css. HTML includes the accessible shell and no-JavaScript fallback. After adding projects, update page/count copy in app.js and index.html.

Run from this directory:

    python -m http.server 8130 --bind 127.0.0.1

Open http://127.0.0.1:8130/. ES modules require a web server. Run npm run check for JavaScript syntax checks and the dependency-free Node tests for circular navigation, language aggregation, and UTC calendar boundaries. No npm install is needed.

## Data, privacy, and honesty

All five public project repos are included: custom-keyboard, nexus-mobile, hyprland-forge, maintaineros, and civiclens. Robo Telescope and Raspberry Pi Home Lab descriptions were supplied by Hrushi.

stack-data.js contains a dated GitHub REST snapshot. Language numbers count the five project repos containing that language, not skill level or lines written. Tool numbers reflect repository source evidence. The calendar is a bounded snapshot of 78 authored public default-branch commits across those five repos plus the portfolio, fetched October 20, 2026. Each commits endpoint response was below the 100-result limit; commits were filtered to author login hrushikbarani-hub. It is not a live GitHub contributions calendar. To refresh, fetch /repos/hrushikbarani-hub/{repo}/languages and /commits?per_page=100&since=2026-04-20T00:00:00Z, paginate if needed, aggregate UTC author dates, and update the snapshot date and UI caption. Never silently claim a capped response is complete.

The footer timer and decorative signal graph describe this local page session, not global visitors. Pointer tracking, command history, themes, and motion stay in the browser. Only theme and motion preferences are persisted. There are no live connections to home services, network endpoints, private contact details, or credentials.

NEXUS Mobile uses existing models; it does not imply a self-trained foundation model or inference on the Pi. Robo Telescope previously worked and is currently under repair. The macro pad is at design stage with assembly, fit, and physical testing pending. Hyprland Forge still needs real hardware validation. MaintainerOS and CivicLens v0.3 are runnable local apps, not backend services hosted by this portfolio.

SVG project images are labeled illustrations. assets/nexus-cad.jpg is the public custom-keyboard/photos/fit-v1.2.jpg CAD preview, not a physical-device photo. App screenshots originate from their public repositories and include labeled fictional demo records.

## Deployment

Push to main. GitHub Pages deploys main / (root), with .nojekyll and HTTPS enabled. No paid domain, subscription, build workflow, or server is required. The MIT license covers this original portfolio code.
