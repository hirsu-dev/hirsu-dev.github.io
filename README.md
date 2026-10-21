# hirsu // from code to the real world

Live: https://hrushikbarani-hub.github.io/. Static portfolio on free GitHub Pages. No Raspberry Pi hosting, backend, paid domain, tracking, accounts, external fonts, or build dependencies.

## Two interfaces

- **Night City** (default): a cinematic acid-yellow / black landing page inspired by the official Cyberpunk 2077 website. Original fictional key art, condensed display type, clipped navigation, project callouts, image-led selected work, alternating sections, and a matching project archive / detail UI. https://hrushikbarani-hub.github.io/?view=neon
- **Overdrive**: the compact alternate explorer, with chartreuse / violet, the expandable rail, text-first feed and wide-desktop identity dock. https://hrushikbarani-hub.github.io/?view=blacksite

Switch in MENU or the footer; the alternate interface also has a sidebar/top-right menu. Mode changes preserve project, gallery shot, bookmarks, search, expansions and motion. History restores modes, including the original bare URL. A new v6 view preference starts returning visitors on the cinematic default unless they use an explicit theme link. Bookmarks and the explicit motion preference are retained locally.

Home is #index. The complete searchable archive is #projects. Old #project- project links, #stack, #bench, #whoami and #themes links remain supported; #work opens the archive.

## Motion direction and references

Primary reference: https://www.cyberpunk.net/us/en/. The supplied clips were inspected through visible playback frames:

- Project E3: UI | New Animations | Cyberpunk 2077 Mod, Virtuoso: https://www.youtube.com/watch?v=60MpEkIcm3g
- Cyberpunk 2077 - Concept UI, Bad Art Studio: https://www.youtube.com/watch?v=ilYgQdyBFf4

The v7 opening is inspired by the assembling-interface idea at https://hancore.dev/site/#stack, reinterpreted in original Cyberpunk-style code. A **2.9-second signal boot** draws a reticle, introduces the wordmark, stages three interface labels, then opens two shutters onto the page. It runs once per full page load, never on internal navigation. Skip and Escape dismiss it immediately. MENU → Replay opening sequence (also in Ctrl / Command K) runs it again without changing the current route, scroll position, gallery, or search. Direct #themes links open the menu without an intro on top.

This is explicitly a visual sequence, not a network request, download progress, or device scan. Its completion timer is independent of asset loading. It uses a native modal for keyboard focus, releases its scroll lock and timers on every exit path, and falls back to ordinary content if dialog support fails. The underlying page and no-JavaScript project links are not hidden by a startup class.

Motion throughout: staggered line-by-line hero assembly, a key-art wipe, occasional sliced red/cyan heading displacement (primary text never disappears), hover interference, scanning HUD lines and project images, drifting target markers, animated section strokes, scroll reveals, clipped menu entrances, pointer parallax, and short route streaks. No audio or full-screen flashing. CSS animations handle the visual timeline without a continuous JavaScript loop. Hidden tabs pause CSS motion and cancel active Web Animations; backgrounding also dismisses the intro.

Toggle FX in the header or animations in the menu. FX off disables the intro and all motion; replay is disabled until FX is enabled. System reduced motion is respected by default, including when storage is blocked; an explicit preference overrides it. Pointer parallax only runs for a fine pointer.

The original hero is a fictional anonymous engineer, not Hrushi or his hardware. No franchise character art, trademarks or reference source code is bundled. Asset provenance and the complete built-in generation prompt: [ART-DIRECTION-V6.md](ART-DIRECTION-V6.md). Earlier original artwork is retained but not loaded.

Sites guidance informed the responsive presentation structure, meaningful project sections, accessibility, and clear distinction between real evidence and illustration.

## Functional controls

Search across project titles, descriptions, status, categories and tags. Multi-word search combines with Software / Hardware / Home lab / Saved filters. Open shows the actual project; Save keeps a browser-local bookmark; Expand reveals features and current state. Images have explicit CAD / illustration / fictional demo captions. Galleries can be enlarged in a native dialog.

Ctrl / Command K opens the searchable command menu; arrows and Enter navigate. On project cards, arrows or J/K move, Enter opens, S saves, E expands, / focuses search and ? opens help. Escape closes dialogs and returns focus. Input fields and native buttons/links retain their standard keys.

The original project-network sphere remains on #network: drag / arrows to rotate, wheel / + / - to zoom, pause / reset and low / mid / high detail. A regular list of project links is also available. Labels separate on narrow displays. The sphere is a conceptual relationship map, not live telemetry or actual device locations.

#stack contains dated public data, not skill ratings. #log contains factual open work, not invented dated activity. #about includes reference credits and privacy notes. Storage failures fall back to session-only bookmarks with an explicit message.

## Grounded content & data

Seven projects: five public project repositories (custom-keyboard, nexus-mobile, hyprland-forge, maintaineros, civiclens) plus Robo Telescope and Raspberry Pi Home Lab, whose descriptions came from Hrushi.

Robo Telescope used to work and is under repair. The Pi runs Pi-hole, VPN and Tailscale services. NEXUS Mobile is an experimental client for existing local AI models, not a self-trained foundation model or a claim of Pi inference. Macro pad physical assembly / fit and Forge real-hardware validation remain pending. MaintainerOS and CivicLens v0.3 are runnable local apps, not backends hosted by this portfolio.

Illustrated project images, actual CAD, and real app screenshots are labeled separately. assets/nexus-cad.jpg is the public custom-keyboard/photos/fit-v1.2.jpg CAD preview, not a device photo. App screenshots contain labeled fictional demo projects / Sample City records.

stack-data.js is the October 20, 2026 public REST snapshot. Language numbers count repositories containing a language across five project repos, not proficiency. The calendar includes 78 authored public default-branch commits across those repos plus this portfolio in the bounded April–October period. It is not a live GitHub contributions calendar. Sources: /repos/hrushikbarani-hub/{repo}/languages and /commits?per_page=100&since=2026-04-20T00:00:00Z. All six commit responses were below the limit. To refresh, paginate as needed, filter author login hrushikbarani-hub, aggregate UTC dates, and update the dated caption. Never imply capped responses are complete.

The sphere is a conceptual map of related projects, not a map of actual locations, connected devices, or network telemetry. No credentials, home IPs, private contact information, or backend endpoints are published. No outbound runtime API calls.

## Edit / verify / deploy

- index.html: shell, cinematic header, preference bootstrap, menu, native dialogs, no-JavaScript fallback.
- city-content.js: original cinematic homepage composition and factual featured projects.
- city.css: cinematic interface and responsive rules, layered over console.css (alternate explorer / shared controls).
- city-motion.js: optional original boot controller, panel / menu / reveal / pointer effects and lifecycle cleanup.
- city-effects.css: original boot, shutters, chromatic slices, scans, hover and ambient motion; layered over the existing interfaces.
- console.js: routes, project rendering, search, bookmarks, galleries, keyboard commands, theme / motion state.
- console-model.js: pure route/search/storage/escaping helpers.
- project-network.js: original sphere renderer and lifecycle.
- projects.js / stack-data.js: factual project metadata and dated snapshot.
- interfaces.js: two-mode registry and validated URL helpers.

No npm install needed:

    npm run check
    python -m http.server 8130 --bind 127.0.0.1

Open http://127.0.0.1:8130/. ES modules need HTTP. Dependency-free tests in site.test.js and motion.test.js cover modes, URLs, routes, search/filtering, malformed storage, escaping, original landing content, all referenced assets, panel frames, the bounded boot timeline, dismissal / replay / focus / timer cleanup, reduced-motion bootstrap with blocked storage, no-JavaScript access, background cancellation, unsupported dialogs, geometry, narrow label spacing, language aggregation, UTC dates and the retained legacy wrap helper.

Push main. GitHub Pages deploys main / root with .nojekyll and HTTPS. No paid service, backend, Pi, or custom domain is required. The preview server may be stopped without affecting the live site.
