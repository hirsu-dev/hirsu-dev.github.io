# hirsu // from code to the real world

Live: https://hrushikbarani-hub.github.io/. Static portfolio on free GitHub Pages. No Raspberry Pi hosting, backend, paid domain, first-party analytics, accounts, external fonts, or runtime npm dependencies. Background radio attempts quiet, same-origin MP3 playback on startup; browsers can require a Play/Retry gesture. The optional Stellarium Web embed loads its own app, fonts, data and analytics only on request. Tests use Happy DOM as a development-only dependency.

## 3D observatory, connected project atlas and startup audio / v21

- **Build Lab:** an original, perspective-projected solid telescope assembly with mouse/touch orbit, keyboard orbit/zoom, selectable components, moving focuser, exploded assembly and wireframe. The existing azimuth/elevation motor preview drives its actual 3D orientation. Horizontal pointing map retained in a disclosure. Model geometry is illustrative, not a measured replica or hardware controller; the actual Robo Telescope remains under repair.
- **Stellarium:** Load Stellarium Web embeds the official browser planetarium, including its own search, sky overlays, time and location controls. Expand/compact and unload controls are provided, plus an external-tab fallback. It is **not** a port of every desktop feature and does **not** synchronize the model with Stellarium selections. No precise-location permission is delegated. The external page is unloaded on build-tab changes and route disposal.
- **Attribution:** the embedded app is independently hosted by [Stellarium Labs](https://stellarium-labs.com/stellarium-web/). The [Web Engine source](https://github.com/Stellarium/stellarium-web-engine) is AGPL-3.0. No Stellarium source/binary/data was copied, modified or relicensed in this repository. Its service availability is external to this site.
- **Project Atlas:** seven original project constellations now occupy a true XYZ volume with perspective, depth-dependent brightness/size, orbital camera easing and a layered stellar/dust background. Shared nodes expose Python-family/CircuitPython, JavaScript, FastAPI, SQLite, Pi-hole and Tailscale connections grounded in project metadata. Physical-build links are explicitly themes, not invented language claims. Filter languages/tools/themes, inspect a project, and follow its shared-node project links. This is an illustrative project graph, not real celestial coordinates.
- **Audio:** quiet startup attempt at 15% each visit. Browser-blocked audio offers Retry; no autoplay restriction is bypassed. The full deck never opens automatically or takes focus. × on either player dismisses **all** floating controls and their page-spacing reservation while audio continues. Radio in the menu reopens it. Stop & unload still stops playback. Track changes, volume, mute, seek, continuous play and full owner-supplied files remain.
- **Accessibility/lifecycle:** keyboard equivalents, accessible project index, native labels, motion-off support, contrast/text-size styling, offscreen/hidden-page suspension, finite geometry, explicit cleanup and no-renderer fallback. Pi home lab, macro pad, portfolio layouts and intros retained.
- **Verification:** 133 automated tests pass. Browser QA covered 3D model orbit, exploded assembly and focus controls at desktop/mobile sizes; actual Stellarium sky rendering; atlas filtering/inspection; blocked-autoplay fallback and real playback continuing with both controls closed. No browser warnings/errors observed in these checks. Mobile Safari, lock-screen playback and a self-hosted Stellarium build were not tested.
- **Edit:** `telescope-3d.js`, `space-math.js`, `observatory.css`, `build-lab.js`; `atlas-model.js`, `project-network.js`, `network-view.js`, `constellation.css`; `music.js`, `audio-output.js`, `music.css`. New geometry/data checks live in `observatory.test.js`.

## Full-file audio radio / v20 history (startup and dismissal superseded in v21)

- Replaces the Spotify preview embed with five complete owner-supplied MP3s. Public hosting/streaming permission was confirmed by the owner on October 22, 2026; no recordings were fetched or extracted by the implementation. See [credits and usage notice](assets/audio/README.md). Music rights are separate from site code and are not licensed to visitors by this repository.
- Includes High Forever (Marlon Hoffstadt Remix), I Really Want to Stay at Your House, Let You Down, **Never Fade Away (SAMURAI Cover) by P.T. Adamczyk / Olga Jankowska**, and Night City. Chippin' In was not supplied. Originals are unchanged; downloads on the owner's computer are untouched.
- Starts at **15% each visit**. Volume and mute controls in both sizes stay synchronized across tracks, routes and layout switches. Web Audio gain controls volume on supported browsers, with a native media-volume fallback when Web Audio is unavailable. Device volume still applies.
- Seek through full recordings, choose a track, skip forward/back, or enable continuous playback (on by default, wraps at the last track). No artificial duration limit, provider account, video or third-party audio requests. Only the current track loads, after an explicit Play click; changing a selection while stopped does not download it.
- × preserves the same audio and position. Pause can cancel a pending Play. Stop unloads the file. Rejections, failed files and stale events provide retry without resurrecting a stopped session. A reload or closing the browser ends the session; background/lock-screen behavior remains subject to browser/OS restrictions.
- Edit `music.js` (catalog/UI), `audio-output.js` (native playback/gain), `music.css`, and `music.test.js`. All previous portfolio features remain unchanged.
- Verification: 124 automated tests pass. Real Chromium-browser checks loaded and played all five MP3s (approximately 3:49, 4:06, 3:47, 4:46 and 3:13), including playback beyond 30 seconds, minimized/page-persistent playback, volume-slider synchronization, seeking with HTTP range support, automatic next-track playback, stop-at-end and unloading. Narrow and desktop layouts were inspected; no browser console warnings/errors were reported. Mobile Safari and lock-screen behavior were not tested.

## Personal Build Lab and background radio / v19 history (provider replaced in v20)

- **Radio × now minimizes, not disconnects.** The same consented Spotify controller and iframe remain mounted; the selected track and playback state survive hiding/reopening controls, page navigation and layout changes. A small strip offers Play/Pause, expand and **Stop**. Stop & disconnect explicitly destroys the player, including pending initialization. Opening or minimizing never starts playback by itself. Spotify/browser/sign-in/preview limits still apply; closing the browser page ends this site session.
- **Build Lab (`#lab`) replaces the generic glitch/CSS editor and fan-fiction Lost Packets page.** Old `#archive` links resolve to Build Lab. The retired generator and fiction modules/styles have been removed from the current source; Git history retains them. Existing fragment storage is left untouched but is no longer read or written.
- **Robo Telescope:** choose a target on a circular map, use bounded angle sliders/presets, and preview a 1.4-second illustrative motor movement. Stop/reset and reduced motion work without hardware access. The horizontal-angle demo is not astronomical coordinates or actual calibration. The real telescope remains explicitly **under repair**.
- **Raspberry Pi:** select Pi-hole, Tailscale or VPN; manually step through each conceptual path or run a bounded trace. No traffic is sent, no addresses or telemetry are shown, and unknown VPN configuration is not invented. The related NEXUS file remains an interface for existing local models and home services.
- **NEXUS Macro Pad:** six clickable/keyboard-operable keys, two example layers and an OLED-style readout navigate all seven actual projects. These are portfolio demo mappings, not verified firmware assignments; physical assembly/fit remains unverified.
- **Accessibility/lifecycle:** native tabs and controls, keyboard alternatives, reduced motion, high contrast and large text. Demo loops/timers stop on tab changes, hidden pages, motion-off and route disposal. No new dependencies, image generation or external demo requests.
- **Edit:** `build-lab.js`, `build-lab-model.js`, `build-lab.css`, `build-lab.test.js`; player lifecycle/UI in `music.js` and `music.css`. Automated tests cover demo geometry, tabs, keyboard, cancellations, radio minimization, pending consented loads, explicit Stop and route regression. Browser automation is unavailable, so rendered layout and actual Spotify playback while minimized still need a real-browser check.

## Switchboard and Redline impact / v18

- **Settings → Customize → Interface layout → Switchboard.** A fourth original layout: oversized stencil-like typography, a spatial circuit map, movable project tiles, SVG wiring, an expandable inspector, and a two-project comparison patch bay. Overdrive remains the default; switching layouts preserves music, preferences and bookmarks.
- **Interact:** search multiple words, filter by project type, isolate the selected project's real connections, run a bounded 1.8-second visual trace, inspect connected files, or arrange the map with Circuit / Align. Drag a tile's grip; keyboard users can move it with arrows (Shift for larger steps) and Home restores that tile. Escape cancels a drag. No idle JavaScript animation loop.
- **Patch A / B:** pin the inspected file to a socket or choose either project from native selects. Swapping sockets keeps the pair distinct. Comparisons show documented relationships, exact shared tools, tools unique to each project and actual statuses—not invented ratings or compatibility claims.
- **Responsive and local:** the small-screen map becomes a touch-friendly file grid; scrolling is not intercepted. Project positions, selected file and comparison pair are validated and stored under `hirsu-switchboard-v18`. Blocked storage degrades to session-only use with a notice. Trace timers, drag captures, frame callbacks and listeners are cleaned up on navigation; hidden pages and motion-off cancel tracing. Large text and high contrast remain supported.
- **Redline:** one 340ms impact shake at the diagonal split, capped at 4px, with no added flashes. Only the artwork moves—the percentage and Skip button stay still. Reduced-motion and hidden-page states disable it. Redline remains the default; all other startup choices are retained.
- **Edit:** `switchboard.js`, `switchboard-model.js`, `switchboard.css`, and `switchboard.test.js`; shake keyframes live in `motion-upgrade.css`. No new dependencies or external requests.
- **Verification:** model, DOM, persistence, pointer/keyboard, motion-lifecycle and full-app route/settings regression tests. Browser control was unavailable, so rendered desktop/mobile layout and animation appearance still require a real-browser check.

## Night sky and Redline / v17

- **The globe is removed.** The homepage and `#network` now share an original flat night-sky atlas: seven project constellations, a seeded depth-layered starfield, slow twinkling, soft nebula haze, and one brief meteor every twelve seconds. These are fictional star patterns for real projects—not astronomical positions or home-network telemetry.
- **Explore:** choose a star on the canvas or a stationary project button to glide into its constellation and inspect related work. Drag/arrows pan, +/− zoom, Home/Reset restores the complete atlas. Constellations/Starfield switches line layers; LOW/MID/RICH adjusts star density. Pause freezes ambience. Homepage wheel scrolling is never intercepted; the dedicated page only zooms with canvas focus. Touch retains vertical page scrolling.
- **Lifecycle/accessibility:** motion-off snaps to a static drawing, canvas focus pauses ambience, hidden/offscreen views stop their render loop, high contrast removes haze and meteors, and disposal releases observers/listeners. If Canvas is unavailable, project selectors and their inspector still work, while drawing controls are disabled.
- **Redline is the new default:** the picker puts it first. A charged three-layer seam, 72 bounded red fragments, a soft impact ring and recoiling gates reveal the page at 100%. All six intros remain interchangeable. The one-time startup preference version is now `hirsu-startup-v17`; old startup choices remain in their old key, while the first v17 visit uses Redline. Subsequent choices persist normally. Other settings, music and bookmarks are untouched. Reset uses Redline.
- **Motion:** a longer eased page entrance with a tiny settling keyframe, layered section entrances, smoother hover/focus transitions, and coordinated Redline timing. Skip/Escape/reduced-motion cancellation and the 2.9-second ceiling are retained; no full-screen flashes.
- **Edit:** `sky-model.js` for deterministic stars/constellation geometry, `project-network.js` for Canvas and interactions, `network-view.js` / `constellation.css` for the atlas UI, and `motion-upgrade.css` / `intro-variants.js` / `city-motion.js` for animation.
- **Verification:** automated geometry, controller, DOM, accessibility and regression checks; production Canvas rendered separately at desktop/mobile dimensions to inspect star spacing. This renderer-only check does not validate CSS or real-browser animation. Full browser QA is unavailable in the current session.

## Background radio and independent layouts / v16 history (minimization superseded in v19)

- **Settings → Customize → Interface layout:** Overdrive remains the default cinematic workbench. Netrunner is a tiled workstation with a searchable file directory, project inspector, expandable build notes and application dock. Relic is a numbered visual dossier with previous/next file navigation and keyboard-operable Overview / Build notes / Tools tabs. Project archive layouts change too. All three share the same factual project data. Palette, effects, intro and accessibility settings remain independent.
- **Background radio:** click RADIO on any page. No dedicated music page: the compact Spotify audio embed stays loaded outside the route outlet through page navigation, settings, startup previews and layout changes. Enable explicitly, then press Play. Closing destroys the player. Six verified selections include High Forever (Marlon Hoffstadt Remix), I Really Want to Stay at Your House, Let You Down, Never Fade Away, Night City and Chippin’ In. Previous/next switch selections; the official Spotify Cyberpunk playlist provides continuous playback according to provider availability.
- **Provider limits:** the native player stays visible at its supported 152px height. No copied recordings, audio extraction, hidden YouTube video, automatic consent, tokens or listening-history storage. Spotify may offer previews or require sign-in; regional/catalog/browser limits apply. Its iframe API has no volume control: use Spotify/device volume. There is deliberately no pretend volume slider. Native Play remains available if programmatic Play is blocked.
- **Privacy / failures:** no Spotify requests before Enable. Lazy script loading, controller timeout, stale-callback cancellation, retry and provider fallback links are tested. Existing local settings storage is migrated by adding a default layout field; no bookmarks or intro choices are reset.
- **Editing:** `music.js` / `music.css` for the dock and verified track metadata; `layouts.js` / `layouts.css` for both new interfaces; `settings-model.js`, `settings.js`, `index.html` and `console.js` for settings and routing.
- **Validation boundary:** automated DOM tests mock provider playback and cannot verify actual streaming or rendered desktop/mobile appearance. A real-browser visual/live-music pass is still needed; browser automation was unavailable for this change.

Music references: [official High Forever release](https://cyberpunk.lnk.to/highforeverremix), the per-track Spotify URLs in `music.js`, [official Cyberpunk playlist](https://open.spotify.com/playlist/37i9dQZF1DWYMokBiQj5qF), [Spotify iframe API](https://developer.spotify.com/documentation/embeds/references/iframe-api).

## Side channels / v15 history (radio superseded in v16)

- **Radio (`#radio`):** High Forever (Marlon Hoffstadt Remix), credited to Petite Meller and Marlon Hoffstadt. Source chain: [artist Linktree](https://linktr.ee/MarlonHoffstadt) → [official release](https://cyberpunk.lnk.to/highforeverremix) → official YouTube Music playlist `OLAK5uy_nfL-pYyNkwhbiJkNpkduuX9cYqygLEJ9k`. No recording is downloaded or hosted. Open the deck, explicitly load YouTube, then press Play. Volume starts at 12%; volume and mute are available. The visible player persists across internal routes. Closing destroys it; backgrounding pauses without auto-resuming. No saved consent, autoplay on arrival, account access or listening history. An error/timeout gives retry and official streaming links; availability, ads, region and browser restrictions are controlled by YouTube. Google privacy/terms links and the external-data boundary are visible before connecting.
- **Signal Lab (`#lab`):** original glitch CSS generator. Tune text, color, displacement, cycle duration and scanlines; choose three presets; pause the live preview; copy or download the generated CSS. Values are bounded and text is rendered safely. Preview respects site motion preferences; export includes system reduced motion. No entered text is sent anywhere.
- **Lost packets (`#archive`):** four small Cyberpunk/Edgerunners-inspired discoveries with hints and original micro-fiction, not copied shards. Find the address in the lab or command palette. Discovery IDs are validated and saved only in `hirsu-fragments-v15`; clearing discoveries does not touch project bookmarks or interface settings. No real network scanning.
- **Project constellation:** fixed labels now select a node instead of instantly navigating away. The camera takes the shortest rotation to bring it forward; the inspector explains the related work and links to actual project pages. New depth-correct arcs, orbital courier trails, selection brackets, Orbital/Connections modes and visible zoom buttons. Node selection locks motion; Reset releases it. Wheel zoom requires focused canvas on the dedicated page, never captures homepage scrolling. Touch drag has pointer ownership/cancellation. Motion-off, offscreen/hidden suspension and canvas fallback remain supported.

Historical v15 editing files included `radio.js`, `signal-model.js` and `signal-pages.js`; the retired generators and fiction modules were removed in v19. Current replacements are listed above.

Validation: `npm ci && npm run check`. DOM/controller tests mock the external player and disable script/stylesheet fetching; they do not claim to verify YouTube streaming or visual layout. This release still needs a real desktop/mobile browser and live playback pass when browser automation is available.

## Compact settings / v14

SETTINGS opens a compact, keyboard-accessible panel, separate from the navigation-only MENU. Its three tabs have independent scrolling and work on mobile. Preferences save automatically in this browser; blocked storage keeps session-only changes and displays a notice. No accounts, analytics or remote settings service.

- **General:** startup autoplay, keyboard shortcuts, smooth section scrolling, local privacy information, and a confirmed reset. Reset restores the default intro and preferences, never saved projects.
- **Accessibility:** system/on/reduced motion, larger reading text, high contrast, and underlined links. System motion follows OS changes live; reduced motion disables the intro, sky ambience and page animation. Tab, Escape and native control navigation are never disabled.
- **Customize:** Overdrive, Netrunner, Relic and Switchboard layouts; Overdrive, Icewire and Monolith color palettes; Signal interference, Clean motion and CRT scanline FX packages; pointer parallax; all six independent startup scenes and manual preview. Palettes change color; layouts change structure. The retired Night City interface is not restored. Accessibility overrides win over skins and FX. Clean/CRT affect page FX, not the selected intro's own artwork.

Edit `settings.css` for panel presentation, skins and visual overrides; `settings-model.js` for validated defaults; `settings.js` for controls, storage and reset; `index.html` for settings content. Preferences use `hirsu-settings-v14`; existing motion and intro choices are retained. `#settings` and legacy `#themes` open customization. Disable startup autoplay to go straight to the page while keeping manual preview available.

## Overdrive

Overdrive is the default interface: an original red/yellow game-menu-style project terminal, a real Shinjuku night photograph, all seven scrolling project showcases, an interactive night-sky atlas and workbench. https://hrushikbarani-hub.github.io/

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

The night-sky atlas is on #network: drag / arrows pan; focused-canvas wheel or + / − zoom; Pause, Reset and star-density controls remain accessible. A fixed project index and regular source links accompany the canvas. It is an illustrated relationship map, not astronomical data or live telemetry.

#stack contains dated public data, not skill ratings. #log contains factual open work, not invented dated activity. #about includes reference credits and privacy notes. Storage failures fall back to session-only bookmarks with an explicit message.

## Grounded content & data

Seven projects: five public project repositories (custom-keyboard, nexus-mobile, hyprland-forge, maintaineros, civiclens) plus Robo Telescope and Raspberry Pi Home Lab, whose descriptions came from Hrushi.

Robo Telescope used to work and is under repair. The Pi runs Pi-hole, VPN and Tailscale services. NEXUS Mobile is an experimental client for existing local AI models, not a self-trained foundation model or a claim of Pi inference. Macro pad physical assembly / fit and Forge real-hardware validation remain pending. MaintainerOS and CivicLens v0.3 are runnable local apps, not backends hosted by this portfolio.

Illustrated project images, actual CAD, and real app screenshots are labeled separately. assets/nexus-cad.jpg is the public custom-keyboard/photos/fit-v1.2.jpg CAD preview, not a device photo. App screenshots contain labeled fictional demo projects / Sample City records.

stack-data.js is the October 20, 2026 public REST snapshot. Language numbers count repositories containing a language across five project repos, not proficiency. The calendar includes 78 authored public default-branch commits across those repos plus this portfolio in the bounded April–October period. It is not a live GitHub contributions calendar. Sources: /repos/hrushikbarani-hub/{repo}/languages and /commits?per_page=100&since=2026-04-20T00:00:00Z. All six commit responses were below the limit. To refresh, paginate as needed, filter author login hrushikbarani-hub, aggregate UTC dates, and update the dated caption. Never imply capped responses are complete.

The illustrated night sky represents related projects, not actual celestial positions, locations, connected devices, or network telemetry. No credentials, home IPs, private contact information, or backend endpoints are published. The portfolio itself makes no outbound runtime API calls; the optional, consent-gated Radio player is the explicit external-service exception.

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
- project-network.js / sky-model.js / constellation.css: night-sky renderer, deterministic geometry, interactions and lifecycle.
- projects.js / stack-data.js: factual project metadata and dated snapshot.
- interfaces.js: Overdrive registry and legacy URL normalization helpers.
- intro-variants.js / intro-scenes.css: startup choices, scene markup, particles and v13 keyframes. Change the particle sizes/timing in `redlineParticles`; edit the `cut-*` rules for Redline's slash and split.
- intro-variants.css: startup picker styling and the optical, data, CRT and shard foundation effects.

Serving the static site requires no npm install. For development checks, install the pinned test-only dependency first (Node 22+):

    npm ci
    npm run check
    python -m http.server 8130 --bind 127.0.0.1

Open http://127.0.0.1:8130/. ES modules need HTTP. Automated checks cover routes, project facts and assets, settings/storage, all intro cleanup paths, night-sky controls/lifecycle, Switchboard interactions, and full-app navigation. `build-lab.test.js` covers pointing math, tabs, macro layers, step controls and cancellation. `side-channel.test.js` covers consent, radio minimization/reopening, explicit Stop, stale callbacks, provider failures and persistent playback state. DOM/canvas/provider doubles do not replace real-browser layout or streaming verification.

Push main. GitHub Pages deploys main / root with .nojekyll and HTTPS. No paid service, backend, Pi, or custom domain is required. The preview server may be stopped without affecting the live site.
