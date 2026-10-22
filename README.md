# hirsu // from code to the real world

Live: https://hrushikbarani-hub.github.io/. Static portfolio on free GitHub Pages. No Raspberry Pi hosting, backend, paid domain, portfolio analytics, accounts, external fonts, or runtime npm dependencies. Optional Radio connects to YouTube only after explicit consent. Tests use Happy DOM as a development-only dependency.

## Side channels / v15

- **Radio (`#radio`):** High Forever (Marlon Hoffstadt Remix), credited to Petite Meller and Marlon Hoffstadt. Source chain: [artist Linktree](https://linktr.ee/MarlonHoffstadt) → [official release](https://cyberpunk.lnk.to/highforeverremix) → official YouTube Music playlist `OLAK5uy_nfL-pYyNkwhbiJkNpkduuX9cYqygLEJ9k`. No recording is downloaded or hosted. Open the deck, explicitly load YouTube, then press Play. Volume starts at 12%; volume and mute are available. The visible player persists across internal routes. Closing destroys it; backgrounding pauses without auto-resuming. No saved consent, autoplay on arrival, account access or listening history. An error/timeout gives retry and official streaming links; availability, ads, region and browser restrictions are controlled by YouTube. Google privacy/terms links and the external-data boundary are visible before connecting.
- **Signal Lab (`#lab`):** original glitch CSS generator. Tune text, color, displacement, cycle duration and scanlines; choose three presets; pause the live preview; copy or download the generated CSS. Values are bounded and text is rendered safely. Preview respects site motion preferences; export includes system reduced motion. No entered text is sent anywhere.
- **Lost packets (`#archive`):** four small Cyberpunk/Edgerunners-inspired discoveries with hints and original micro-fiction, not copied shards. Find the address in the lab or command palette. Discovery IDs are validated and saved only in `hirsu-fragments-v15`; clearing discoveries does not touch project bookmarks or interface settings. No real network scanning.
- **Project constellation:** fixed labels now select a node instead of instantly navigating away. The camera takes the shortest rotation to bring it forward; the inspector explains the related work and links to actual project pages. New depth-correct arcs, orbital courier trails, selection brackets, Orbital/Connections modes and visible zoom buttons. Node selection locks motion; Reset releases it. Wheel zoom requires focused canvas on the dedicated page, never captures homepage scrolling. Touch drag has pointer ownership/cancellation. Motion-off, offscreen/hidden suspension and canvas fallback remain supported.

Primary new editing files: `radio.js`, `signal-model.js`, `signal-pages.js`, `side-channel.css`, `network-view.js`, `project-network.js`. The existing startup scenes, settings, real photographs and project status facts are retained.

Validation: `npm ci && npm run check`. DOM/controller tests mock the external player and disable script/stylesheet fetching; they do not claim to verify YouTube streaming or visual layout. This release still needs a real desktop/mobile browser and live playback pass when browser automation is available.

## Compact settings / v14

SETTINGS opens a compact, keyboard-accessible panel, separate from the navigation-only MENU. Its three tabs have independent scrolling and work on mobile. Preferences save automatically in this browser; blocked storage keeps session-only changes and displays a notice. No accounts, analytics or remote settings service.

- **General:** startup autoplay, keyboard shortcuts, smooth section scrolling, local privacy information, and a confirmed reset. Reset restores the default intro and preferences, never saved projects.
- **Accessibility:** system/on/reduced motion, larger reading text, high contrast, and underlined links. System motion follows OS changes live; reduced motion disables the intro, automatic globe rotation and page animation. Tab, Escape and native control navigation are never disabled.
- **Customize:** Overdrive, Icewire and Monolith styles; Signal interference, Clean motion and CRT scanline FX packages; pointer parallax; all six independent startup scenes and manual preview. These are skins of the same Overdrive project interface, not a restoration of Night City. Accessibility overrides win over skins and FX. Clean/CRT affect page FX, not the selected intro's own artwork.

Edit `settings.css` for panel presentation, skins and visual overrides; `settings-model.js` for validated defaults; `settings.js` for controls, storage and reset; `index.html` for settings content. Preferences use `hirsu-settings-v14`; existing motion and intro choices are retained. `#settings` and legacy `#themes` open customization. Disable startup autoplay to go straight to the page while keeping manual preview available.

## Overdrive

Overdrive is the only interface: an original red/yellow game-menu-style project terminal, a real Shinjuku night photograph, all seven scrolling project showcases, an interactive globe and workbench. https://hrushikbarani-hub.github.io/

SETTINGS and the footer open preferences; MENU contains page navigation and a settings shortcut. Night City has been removed from the menu, command palette and active renderer. Old `?view=neon` links and saved theme preferences now open Overdrive without losing the project hash. Historical styles/source remain for provenance but the retired homepage module is not loaded. Bookmarks and explicit motion preferences are retained locally. Motion defaults on unless the visitor requests reduced motion or previously paused FX.

Home is #index. The complete searchable archive is #projects. Old #project- project links, #stack, #bench, #whoami and #themes links remain supported; #work opens the archive.

## Independent scene animation / v13

Redline is rebuilt around two complementary diagonal screen masks. The split wordmark converges, a red slash draws across it, 48 deterministic pixel sparks burst from points along the slash, and the two screen halves tear apart to reveal the real page. The particles are bounded CSS elements, not a continuous JavaScript render loop. There is no bright full-screen flash.

The other new sequences also have separate compositions: an optical core, a typing terminal, an oscilloscope trace and converging geometric plates. They no longer show recolored copies of the original centered loader. Signal Fracture preserves the original. The shared percentage and Skip control remain small HUD elements; the existing bounded controller and cancellation rules apply to every scene. Scene geometry and keyframes are in `intro-scenes.css` and `intro-variants.js`.

## Interchangeable startup sequences / v12 foundation

MENU → **Startup / Select a sequence** offers six original treatments: Signal Fracture (the original eight-band glitch), Neural Link (optical rings and a radial rush), Data Rain (falling code and upward peel), Redline (diagonal split gates), Ghost Scan (CRT trace and line collapse), and Shard Assembly (six converging/scattering plates). Native radio cards provide keyboard selection and static previews. Use **Preview** to play the selected sequence; the choice is saved in `hirsu-startup-v12` independently of theme and motion. Blocked storage gives a session-only notice; unknown saved values fall back to Signal Fracture.

Every treatment uses the same bounded 2.9-second controller: 100% at 2.25 seconds, the exit transition begins at 2.25–2.38 seconds depending on the scene, and completion is at 2.9 seconds. No network request or asset loading controls the timer. Skip, Escape, backgrounding, FX-off and unsupported dialogs release the modal and scroll lock. Preview returns focus to the visible MENU button. FX-off disables preview without forgetting the selected sequence; system reduced motion remains respected. Decorative code is not a shell or device scan. No sound or bright full-screen strobes.

`intro-variants.js` holds the validated registry, radio cards and decorative geometry; `intro-variants.css` holds the distinct compositions and transitions. `intro.test.js` and expanded `motion.test.js` cover each treatment's selection, completion and cancellation paths.

## Project terminal & real photography / v11

The default homepage is now a working project directory: select any of seven files to inspect its preview, description, factual status, tools and source link. Arrow keys wrap through files, Home/End jump, and Tab reaches the preview and links. Selection uses native buttons and ARIA tabs; transitions use the existing optional motion controller. The full scrolling archive and globe remain below.

The original composition uses warning-red frames, yellow selection bars, cyan metadata, stepped panel cuts and existing localized glitches. Both active backgrounds now load **Shinjuku by Night by Fboas**, a real camera photograph under **CC BY 3.0**. The original is bundled alongside a smaller responsive copy, with visible attribution on both homepages and in About. See [PHOTO-CREDITS.md](PHOTO-CREDITS.md) for the source, license and display-change notes. Generated hero art is no longer used by either interface. Actual project screenshots and illustrations retain their factual labels and unchanged files.

## Angular HUD / v10 history

Adds notched panel shells, stepped borders, warning-red accents, clipped controls, targeting-frame marks, a decorative animated meter, localized image-slice interference, stronger chromatic heading glitches and hover/focus scans. The visual HUD is labeled as non-telemetry. No new assets or dependencies; actual project images remain unchanged. FX-off and hidden-tab rules cover the new effects. The existing 100%-to-glitch intro is retained.

## Overdrive scroll / v9

Overdrive is now a continuous, native-scrolling page. Section jumps use smooth scrolling when FX is enabled and move keyboard focus to the destination heading. The embedded globe deliberately does not capture wheel scrolling; drag, arrow keys, +/−, pause, reset and detail controls remain available. The separate network page retains wheel zoom. All seven project images use the same contained 16:10 presentation and factual captions.

The intro progresses from 000% to 100% over 2.25 seconds, briefly holds, then fractures into eight alternating horizontal signal bands. The homepage begins assembling underneath the bands so the two motions overlap instead of waiting for a second entrance. The modal closes at 2.9 seconds. Skip, Escape, FX-off, hidden tabs and replay still have deterministic cleanup. The number measures the visual sequence, not network loading.

More visible low-contrast grain, more frequent rolling static, a moving discipline ticker, chromatic title slices, eased scroll reveals and frame-rate-independent pointer damping give the interface a continuous motion cadence. No wheel hijacking, audio, white flashes, or external animation dependencies.

## Signal foundation / v8

The v8 foundation added rooftop key art (replaced by real photography in v11), a depth-layered project globe, animated static grain, low-opacity rolling scans, chromatic text slices and orbital boot rings. Project images use shared 16:10 contained stages and consistent captions. Actual CAD and application screenshot files remain unchanged and are not cropped or color-filtered.

The globe has front/back mesh depth, a point shell, curved project connections with decorative traveling points, orbital rings and stable docking labels. Rotation, drag and zoom ease into position. Keyboard focus and the pause control stop automatic motion. FX off leaves a static, manually operable globe; hidden/offscreen canvases stop rendering. Geometry, theme colors and label measurements are cached. A canvas-unavailable fallback keeps project links usable.

Page and dialog entrances now unfold in layers. Hero parallax eases rather than snapping; galleries transition after image decoding; project expansion, stack bars, cards, navigation, rail and toasts share a coordinated motion cadence. New animations honor the existing FX setting and system reduced-motion default.

## Motion direction and references

Primary reference: https://www.cyberpunk.net/us/en/. The supplied clips were inspected through visible playback frames:

- Project E3: UI | New Animations | Cyberpunk 2077 Mod, Virtuoso: https://www.youtube.com/watch?v=60MpEkIcm3g
- Cyberpunk 2077 - Concept UI, Bad Art Studio: https://www.youtube.com/watch?v=ilYgQdyBFf4

The opening is inspired by the assembling-interface idea at https://hancore.dev/site/#stack, reinterpreted in original Cyberpunk-style code. The v9 scrolling flow also references https://hancore.dev/. A **2.9-second signal boot** draws a reticle, introduces the wordmark, stages three interface labels, reaches 100%, then glitches into the page. It runs once per full page load, never on internal navigation. Skip and Escape dismiss it immediately. MENU → Replay opening sequence (also in Ctrl / Command K) runs it again without changing the current route, scroll position, gallery, or search. Direct #themes links open the menu without an intro on top.

This is explicitly a visual sequence, not a network request, download progress, or device scan. Its completion timer is independent of asset loading. It uses a native modal for keyboard focus, releases its scroll lock and timers on every exit path, and falls back to ordinary content if dialog support fails. The underlying page and no-JavaScript project links are not hidden by a startup class.

Motion throughout: staggered line-by-line hero assembly, a key-art wipe, occasional sliced red/cyan heading displacement (primary text never disappears), hover interference, scanning HUD lines and project images, drifting target markers, animated section strokes, scroll reveals, clipped menu entrances, pointer parallax, and short route streaks. No audio or full-screen flashing. CSS animations handle the visual timeline without a continuous JavaScript loop. Hidden tabs pause CSS motion and cancel active Web Animations; backgrounding also dismisses the intro.

Toggle FX in the header or animations in the menu. FX off disables the intro and all motion; replay is disabled until FX is enabled. System reduced motion is respected by default, including when storage is blocked; an explicit preference overrides it. Pointer parallax only runs for a fine pointer.

The current hero is a genuine licensed city photograph, not a portrait of Hrushi or a picture of his hardware. No franchise character art, trademarks or reference source code is bundled. Earlier generated artwork and [its v8 provenance](ART-DIRECTION-V8.md) are retained as historical assets, but neither active homepage loads them.

Sites guidance informed the responsive presentation structure, meaningful project sections, accessibility, and clear distinction between real evidence and illustration.

## Functional controls

Search across project titles, descriptions, status, categories and tags. Multi-word search combines with Software / Hardware / Home lab / Saved filters. Open shows the actual project; Save keeps a browser-local bookmark; Expand reveals features and current state. Images have explicit CAD / illustration / fictional demo captions. Galleries can be enlarged in a native dialog.

Ctrl / Command K opens the searchable command menu; arrows and Enter navigate. On project cards, arrows or J/K move, Enter opens, S saves, E expands, / focuses search and ? opens help. Escape closes dialogs and returns focus. Input fields and native buttons/links retain their standard keys.

The upgraded project-network sphere is on #network: drag / arrows to rotate, wheel / + / - to zoom, pause / reset and low / mid / high detail. A regular list of project links is also available. Labels dock on alternating vertical positions on narrow displays. The sphere is a conceptual relationship map, not live telemetry or actual device locations.

#stack contains dated public data, not skill ratings. #log contains factual open work, not invented dated activity. #about includes reference credits and privacy notes. Storage failures fall back to session-only bookmarks with an explicit message.

## Grounded content & data

Seven projects: five public project repositories (custom-keyboard, nexus-mobile, hyprland-forge, maintaineros, civiclens) plus Robo Telescope and Raspberry Pi Home Lab, whose descriptions came from Hrushi.

Robo Telescope used to work and is under repair. The Pi runs Pi-hole, VPN and Tailscale services. NEXUS Mobile is an experimental client for existing local AI models, not a self-trained foundation model or a claim of Pi inference. Macro pad physical assembly / fit and Forge real-hardware validation remain pending. MaintainerOS and CivicLens v0.3 are runnable local apps, not backends hosted by this portfolio.

Illustrated project images, actual CAD, and real app screenshots are labeled separately. assets/nexus-cad.jpg is the public custom-keyboard/photos/fit-v1.2.jpg CAD preview, not a device photo. App screenshots contain labeled fictional demo projects / Sample City records.

stack-data.js is the October 20, 2026 public REST snapshot. Language numbers count repositories containing a language across five project repos, not proficiency. The calendar includes 78 authored public default-branch commits across those repos plus this portfolio in the bounded April–October period. It is not a live GitHub contributions calendar. Sources: /repos/hrushikbarani-hub/{repo}/languages and /commits?per_page=100&since=2026-04-20T00:00:00Z. All six commit responses were below the limit. To refresh, paginate as needed, filter author login hrushikbarani-hub, aggregate UTC dates, and update the dated caption. Never imply capped responses are complete.

The sphere is a conceptual map of related projects, not a map of actual locations, connected devices, or network telemetry. No credentials, home IPs, private contact information, or backend endpoints are published. The portfolio itself makes no outbound runtime API calls; the optional, consent-gated Radio player is the explicit external-service exception.

## Edit / verify / deploy

- index.html: shell, cinematic header, preference bootstrap, menu, native dialogs, no-JavaScript fallback.
- city-content.js: archived Night City homepage, no longer imported by the active renderer.
- overdrive-content.js / overdrive.css: continuous Overdrive homepage, responsive showcase system, 100%-to-glitch transition and v9 motion refinements.
- project-terminal.js / terminal-ui.css: v11 interactive file directory and red/yellow material system.
- photo.js / PHOTO-CREDITS.md: shared responsive photograph metadata, visible attribution and license notes.
- city.css: cinematic interface and responsive rules, layered over console.css (alternate explorer / shared controls).
- city-motion.js: optional original boot controller, panel / menu / reveal / pointer effects and lifecycle cleanup.
- city-effects.css: original boot, shutters, chromatic slices, scans, hover and ambient motion; layered over the existing interfaces.
- city-upgrade.css: v8 media system, static grain, orbital boot rings, motion refinements and observatory styling.
- console.js: routes, project rendering, search, bookmarks, galleries, keyboard commands, theme / motion state.
- console-model.js: pure route/search/storage/escaping helpers.
- project-network.js: original sphere renderer and lifecycle.
- projects.js / stack-data.js: factual project metadata and dated snapshot.
- interfaces.js: Overdrive registry and legacy URL normalization helpers.
- intro-variants.js / intro-scenes.css: startup choices, scene markup, particles and v13 keyframes. Change the particle sizes/timing in `redlineParticles`; edit the `cut-*` rules for Redline's slash and split.
- intro-variants.css: startup picker styling and the optical, data, CRT and shard foundation effects.

Serving the static site requires no npm install. For development checks, install the pinned test-only dependency first (Node 22+):

    npm ci
    npm run check
    python -m http.server 8130 --bind 127.0.0.1

Open http://127.0.0.1:8130/. ES modules need HTTP. Tests cover default mode, URLs, routes, search/filtering, malformed storage, escaping, both homepages, photo attribution, assets, file selection and keyboard navigation, panel frames, boot percentage/release/dismissal/replay/focus/timer cleanup, reduced-motion bootstrap with blocked storage, no-JavaScript access, unsupported dialogs, finite spherical arcs, collision-free docking, embedded globe scroll passthrough, globe pause/focus/quality/visibility/FX/lifecycle behavior, canvas fallback, language aggregation, UTC dates and the legacy wrap helper. `side-channel.test.js` adds DOM-level signal editing, clipboard failure, safe text rendering, fragment persistence, no-consent/no-provider-request assertions, player readiness/errors/cancellation, route-persistent playback and background pause. Controller tests use deterministic DOM/canvas/RAF doubles; they do not replace visual browser QA.

Push main. GitHub Pages deploys main / root with .nojekyll and HTTPS. No paid service, backend, Pi, or custom domain is required. The preview server may be stopped without affecting the live site.
