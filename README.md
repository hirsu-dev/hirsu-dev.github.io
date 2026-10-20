# hirsu — two cyberpunk interfaces, one workbench

Hrushi's portfolio: https://hrushikbarani-hub.github.io/. Free GitHub Pages, no Raspberry Pi or backend required. Static HTML, CSS, ES modules and original Canvas 2D graphics; no dependencies, third-party fonts, tracking, login, API keys, or installation step.

## Choose an interface

Use the top-right interface menu on any page:

- **Nightshift** — Cyberpunk 2077-inspired acid yellow / black, an original city-workshop illustration, horizontal project directory, large editorial typography, and a seven-project gallery. Direct link: https://hrushikbarani-hub.github.io/?view=neon
- **Overdrive** — Edgerunners-inspired chartreuse / violet, an angular key-art hero, vertical file navigator, compact scrollable terminal, pointer-following ASCII optic, and rotating schematic. Direct link: https://hrushikbarani-hub.github.io/?view=blacksite

These are distinct layouts, not palette swaps. Switching preserves the current project, screenshot index, command output, and motion setting. The selected interface is saved locally. An explicit valid view query parameter overrides the saved choice; invalid values fall back safely. Links preserve the selected project hash. Browser back/forward supports both page and interface navigation. Initial preference is applied before CSS loads to reduce flashing.

See ART-DIRECTION.md for official visual references, the original generated asset, and its complete built-in image-generation prompt. The official trailer was age-restricted; no full-series viewing is claimed.

The older hancore.dev reference informed the terminal-exploration idea, but the new layouts, skyline, radar, schematic, interface art, and personal content are original. No reference-site code or assets are bundled. The old curved wheel, branching spine, and hand diagrams are no longer displayed.

## Controls

- Click a directory entry, use ↑ / ↓ or Home / End, or swipe the horizontal directory on phones.
- Use ← / → or image buttons for available project screenshots. Click a preview to enlarge; Escape closes dialogs.
- Press : for the browser-local command line. help lists commands; ↑ / ↓ recall history.
- Commands: ls, whoami, open maintaineros, stack, interfaces (or themes), workbench, search python, view neon, view blacksite, status, clear, and motion / eye / worm / ghost [on|off]. theme is an alias for view, not the old four-palette selector.
- Pause animation in the interface menu or footer. System reduced-motion preference is respected by default; explicit choice overrides it. Rendering pauses in hidden tabs. Eye controls are relevant to Overdrive's optic panel.
- Commands never execute on your computer. Only interface and motion preferences are persisted.

## Edit and verify

Project descriptions, source links, images, status and provenance: projects.js. Shared pages and interactions: app.js. Interface registry, URL resolution and validation: interfaces.js. Artwork and motion: motion.js. Shared base utilities: styles.css; both current layouts and responsive rules: cyberpunk.css. HTML contains the shell, menu, lightweight preference bootstrap, accessible dialogs and no-JavaScript fallback.

After adding projects, update the displayed page / project / repo counts. Current content is seven projects: five public project repositories plus two personal builds.

Run from this directory:

    python -m http.server 8130 --bind 127.0.0.1

Open http://127.0.0.1:8130/. ES modules require a web server. npm run check performs syntax checks and five dependency-free Node tests covering the two-mode registry, explicit / saved preference resolution, URL and project-hash preservation, circular navigation, language counts and UTC calendar boundaries. No npm install is needed.

## Grounded content and privacy

All five public project repos are included: custom-keyboard, nexus-mobile, hyprland-forge, maintaineros and civiclens. Robo Telescope and Raspberry Pi Home Lab descriptions came from Hrushi.

NEXUS Mobile is an experimental client for existing local models, not a self-trained foundation model or a claim of inference on the Pi. Robo Telescope previously worked and is currently under repair. Macro pad assembly, physical fit and testing are pending. Forge still needs real hardware validation. MaintainerOS and CivicLens v0.3 are runnable local apps, not backend services hosted by the portfolio.

SVG project images are labeled illustrations. assets/nexus-cad.jpg is the public custom-keyboard/photos/fit-v1.2.jpg CAD preview, not a device photograph. App screenshots originate from the public repositories and include labeled fictional demo records. Captions appear on both gallery cards and detail pages.

stack-data.js is a dated public GitHub REST snapshot: language numbers count five project repos with that language, not proficiency; tool numbers reflect source evidence. The calendar shows 78 authored public default-branch commits across those repos plus the portfolio, April–October 20, 2026. All six bounded responses were below the 100-result limit. It is not a live GitHub contributions calendar. Refresh using /repos/hrushikbarani-hub/{repo}/languages and /commits?per_page=100&since=2026-04-20T00:00:00Z; paginate as needed, filter author login hrushikbarani-hub and aggregate UTC dates. Update the dated caption with the data. Do not imply capped responses are complete.

The skyline, radar, moving geometry and signal bars are generative visuals, not live network telemetry. The optic reacts to local pointer coordinates; it does not use a camera. Timer, pointer coordinates, command history and optional companions stay in the page. No analytics, home endpoints, credentials, network addresses or private contact details are published.

## Deployment

Push main. GitHub Pages deploys main / (root), with .nojekyll and HTTPS. No paid domain, subscription, build workflow or server is needed. The MIT license covers this original portfolio code.
