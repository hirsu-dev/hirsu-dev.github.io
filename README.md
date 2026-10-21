# hirsu // personal project network

Hrushi's portfolio: https://hrushikbarani-hub.github.io/. Free GitHub Pages; no Raspberry Pi, server, account, paid domain, tracking, third-party fonts, or build dependencies.

## The two interfaces

- **Cyberspace** (default): a compact text-first feed, slim expandable navigation rail, warm phosphor colors, red/cyan HUD framing, and bracketed actions. https://hrushikbarani-hub.github.io/?view=neon
- **Overdrive**: chartreuse / violet, sharp typography, cel-like contrast, and a sticky identity dock beside the content on wide desktops. It stacks responsively on smaller screens. https://hrushikbarani-hub.github.io/?view=blacksite

Switch with the top-right menu, sidebar, or identity-panel controls. Project, gallery position, search, expanded cards, bookmarks, and animation setting survive theme changes. Back/forward preserves theme changes, including the first URL without a view query. Existing project hashes, #project- aliases, #stack, #bench, #whoami, and #themes links are supported.

The new v5 preference key starts existing visitors on the new default unless an explicit theme link was used. Preferences and project IDs are browser-local; blocked storage falls back to session-only behavior.

## Explore

- **Index:** search across project titles, descriptions, statuses, categories, and tags; combine search words with Software / Hardware / Home lab filters.
- **Open / Save / Expand:** open the project, keep a local bookmark, or progressively reveal features and current status.
- **Network:** an original Canvas 2D project sphere inspired by the reference site's globe. Drag to rotate, wheel to zoom, or focus the canvas and use arrows / + / -. Click a project label to open it. Low / mid / high wireframe detail, reset, and rotation controls are provided. Labels spread apart on narrow screens. A normal project-link list remains available below.
- **Stack:** dated public repository language counts and commit snapshot, not skill ratings or live activity.
- **Workbench:** factual unfinished work, not invented chronological updates.
- **About:** content provenance, reference credits, and privacy details.

Keyboard: Ctrl / Command K opens the searchable command menu. Arrow keys navigate commands; Enter chooses. On the feed, arrows or J/K move between cards, Enter opens, S saves, E expands, / focuses search, and ? opens help. Normal input fields and native button/link keys retain their behavior. Project image buttons and left/right keys change available screenshots. Native dialogs close with Escape and return focus.

Motion is optional. The system reduced-motion setting is honored by default; an explicit preference overrides it. Sphere animation pauses in hidden tabs, with motion disabled, when rotation is paused, or while keyboard focus is inside the map. Drag and keyboard manipulation remain possible with animation disabled. No flashing glitch loop or autoplay sound.

## Sources and visual direction

Main reference: https://cyberspace.online/ — text-first panels, sidebar navigation, bracket actions, command menu, and globe exploration. This is an original implementation, not copied source, community posts, member identities, or site assets.

The provided video, https://www.youtube.com/watch?v=yLdJh2_-o8U (The ONLY Guide to Cyberpunk UI Design), was reviewed through its accessible English captions. Useful principles: modular sections, contrasting dark palettes, monospace type, geometric framing, vertical navigation, focus/hover states, and progressive disclosure.

Official Cyberpunk 2077 game HUD screenshots in https://www.cyberpunk.net/en/news/49591/update-2-1-accessibility-features informed restrained red/cyan framing and readable controls. Official https://www.cyberpunk.net/en/edgerunners art informed Overdrive's chartreuse / violet contrast. No claim of watching the full anime, hearing inaccessible audio, or playing the game. No franchise logos, artwork, or source are bundled in v5.

ART-DIRECTION.md retains the provenance and complete prompt for the previous original generated illustration. That fictional artwork and older source files are retained but are not loaded by the current interface.

## Grounded content & data

Seven projects: five public project repositories (custom-keyboard, nexus-mobile, hyprland-forge, maintaineros, civiclens) plus Robo Telescope and Raspberry Pi Home Lab, whose descriptions came from Hrushi.

Robo Telescope used to work and is under repair. The Pi runs Pi-hole, VPN and Tailscale services. NEXUS Mobile is an experimental client for existing local AI models, not a self-trained foundation model or a claim of Pi inference. Macro pad physical assembly / fit and Forge real-hardware validation remain pending. MaintainerOS and CivicLens v0.3 are runnable local apps, not backends hosted by this portfolio.

Illustrated project images, actual CAD, and real app screenshots are labeled separately. assets/nexus-cad.jpg is the public custom-keyboard/photos/fit-v1.2.jpg CAD preview, not a device photo. App screenshots contain labeled fictional demo projects / Sample City records.

stack-data.js is the October 20, 2026 public REST snapshot. Language numbers count repositories containing a language across five project repos, not proficiency. The calendar includes 78 authored public default-branch commits across those repos plus this portfolio in the bounded April–October period. It is not a live GitHub contributions calendar. Sources: /repos/hrushikbarani-hub/{repo}/languages and /commits?per_page=100&since=2026-04-20T00:00:00Z. All six commit responses were below the limit. To refresh, paginate as needed, filter author login hrushikbarani-hub, aggregate UTC dates, and update the dated caption. Never imply capped responses are complete.

The sphere is a conceptual map of related projects, not a map of actual locations, connected devices, or network telemetry. No credentials, home IPs, private contact information, or backend endpoints are published. No outbound runtime API calls.

## Edit / verify / deploy

Current entry points:

- index.html: accessible shell, preference bootstrap, native dialogs, no-JavaScript fallback.
- console.js: rendering, navigation, galleries, bookmarks, keyboard commands, theme / motion controls.
- console-model.js: pure route, search, bookmark-validation, and escaping helpers.
- console.css: both interfaces and responsive layouts.
- project-network.js: original sphere renderer and animation lifecycle.
- projects.js: verified project facts, status, source, gallery metadata.
- stack-data.js: dated public data snapshot.
- interfaces.js: two-mode registry and validated URL helpers.

No npm install needed:

    npm run check
    python -m http.server 8130 --bind 127.0.0.1

Open http://127.0.0.1:8130/. ES modules need HTTP. Eleven Node tests cover interfaces, URL preservation, filters/search, corrupted storage, escaping, route aliases, project geometry, label spacing, language aggregation, UTC calendar boundaries, and a retained legacy wrap helper.

Push main to deploy GitHub Pages from main / root, with .nojekyll and HTTPS. Source is MIT licensed. Free hosting is independent of the local preview server.
