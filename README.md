# hirsu — from code to the real world

**Live site:** [hrushikbarani-hub.github.io](https://hrushikbarani-hub.github.io/)

This is my personal portfolio and project hub. It is a static website hosted on GitHub Pages. It has no backend, account system, paid domain, first-party analytics, or runtime npm dependencies.

The site includes 14 projects, four interface layouts, a searchable project archive, an interactive project map, build logs, accessibility settings, and an optional music player. Most content and settings stay in your browser. The music player tries to start quietly at 15% volume. Browsers may require a Play/Retry click. Stellarium Web is available as an optional external embed.

## Projects

The portfolio covers 12 public code projects and two personal builds. The original work includes:

- **Custom Keyboard / NEXUS Macro Pad:** a six-key macro pad with an OLED screen. The PCB, case, and firmware are in progress; physical fit has not been confirmed.
- **NEXUS Mobile:** an experimental iOS companion app for local models and home services. It does not train its own AI model.
- **Hyprland Forge:** a Linux setup project. Real-hardware testing is still pending.
- **MaintainerOS:** a local app that helps organize public GitHub issues and pull requests.
- **CivicLens:** a local app for tracking public decisions and linking them to their sources.
- **Robo Telescope:** a telescope project that is currently under repair. The site demo does not control real hardware.
- **Raspberry Pi Home Lab:** a home setup with services such as Pi-hole, Tailscale, and VPN tools. The site does not connect to or scan the network.

Seven version 0.1 tools now have their own repositories and free browser editions:

| Project                       | Browser app                                                               | Source and local setup                                                        |
| ----------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Observatory Planner           | [Try it](https://hrushikbarani-hub.github.io/observatory-planner/)        | [Repository](https://github.com/hrushikbarani-hub/observatory-planner)        |
| Pointing Lab                  | [Try it](https://hrushikbarani-hub.github.io/coordinate-motor-simulator/) | [Repository](https://github.com/hrushikbarani-hub/coordinate-motor-simulator) |
| Lantern / Homelab Health      | [Try it](https://hrushikbarani-hub.github.io/homelab-health/)             | [Repository](https://github.com/hrushikbarani-hub/homelab-health)             |
| Quiet Hours / Privacy Auditor | [Try it](https://hrushikbarani-hub.github.io/network-privacy-auditor/)    | [Repository](https://github.com/hrushikbarani-hub/network-privacy-auditor)    |
| Open Sky                      | [Try it](https://hrushikbarani-hub.github.io/accessible-star-map/)        | [Repository](https://github.com/hrushikbarani-hub/accessible-star-map)        |
| Benchbook                     | [Try it](https://hrushikbarani-hub.github.io/repair-parts-tracker/)       | [Repository](https://github.com/hrushikbarani-hub/repair-parts-tracker)       |
| Fieldnotes                    | [Try it](https://hrushikbarani-hub.github.io/offline-project-notebook/)   | [Repository](https://github.com/hrushikbarani-hub/offline-project-notebook)   |

These are working first releases, labeled as prototypes. Astronomy calculations have stated limits, the public health dashboard uses synthetic data, and actual offline reload/screen-reader testing remains unverified. The new cover images are original SVG diagrams, not photographs or claimed screenshots. Each app's README documents its checks and limitations.

The portfolio labels illustrations, CAD previews, screenshots, and demos so they are not mistaken for photos or verified hardware. Its project map is an illustration, not live network or astronomy data.

## Using the site

- Browse projects by searching, filtering, opening, or saving them in your browser.
- Pick an interface layout, color palette, visual effects, and startup animation in **Settings**.
- Orbit the 3D night-sky project map to explore shared languages, tools and services. Filter connections and select a star to inspect its project.
- Use keyboard controls and accessibility options such as reduced motion, larger text, and high contrast.
- Open the **Build Lab** to orbit a solid 3D telescope, inspect its parts, extend the focuser, try wireframe or explode the assembly. Azimuth/elevation previews move the model, never real hardware. The Pi and macro-pad demos are still available.
- **Radio** attempts low-volume startup playback and offers Retry when blocked. × hides every floating player control while music continues; reopen Radio from the menu. Volume, mute, seek, track selection and Stop & unload remain available.
- **Build logs / status** has a manually reviewed status board, dated notes, project/date/search filters, and a separate link for each note. **Experiments** separates runnable prototypes from any planned work and shows the next step.

## Adding build notes

Edit `workbench-data.js` for status, next steps, notes and planned experiments; `new-projects.js` contains the seven app descriptions, source links and demo links. Experiment cards derive their runnable state from those app records. Review dates describe the content review, not a new hardware test. Each note has a goal, change, limitation, takeaway, next step and a labeled image. Its link is `#entry-<id>`; all notes are at `#log`. See [the phased roadmap](ROADMAP.md) for release evidence and next milestones.

The site makes no runtime API calls for portfolio data. Radio loads the current same-origin track when attempting startup playback or after Play/Retry. Audio files are supplied by the owner. See [the audio credits and usage notice](assets/audio/README.md). The site's code license does not give visitors permission to reuse the music.

## Stellarium and the 3D sky

**Load Stellarium Web** in Build Lab opens the official browser planetarium. Search its sky and use its time, location, constellation and grid controls. Expand/compact and unload controls are included, with a separate-tab fallback. Leaving the build tab or page unloads the embedded app.

This is [Stellarium Web](https://stellarium-labs.com/stellarium-web/), not every feature of desktop Stellarium. It is separate from the telescope model: selecting a star does not move the model or real hardware. The external app contacts Stellarium’s servers and analytics only after Load; this portfolio does not delegate precise-location permission. The [Web Engine](https://github.com/Stellarium/stellarium-web-engine) is AGPL-3.0. No Stellarium source, binary or data was copied or relicensed here; availability is controlled by Stellarium.

The portfolio atlas is a separate, original XYZ project graph with a layered night-sky background. Its language and tool links come from the documented projects. CircuitPython is labeled as a Python-family connection; physical-build links are themes, not invented shared languages. Positions are illustrative, not astronomical coordinates.

## Run it locally

You need Node.js 22 or newer for the development checks. The site itself is static and does not need an npm install to serve.

```powershell
npm ci
npm run check
npx http-server . -p 8130 -a 127.0.0.1 -c-1
```

Then open [http://127.0.0.1:8130/](http://127.0.0.1:8130/). The site uses JavaScript modules, so serve it over HTTP instead of opening `index.html` directly. The preview server supports HTTP range requests so full-song seeking works.

The automated suite covers project data, routing, settings, keyboard controls, animation lifecycles, 3D geometry, audio, interactive demos and build notes. Earlier browser checks covered telescope controls, Stellarium rendering, blocked autoplay and background playback. Offline reload, screen-reader use, Mobile Safari and lock-screen behavior still need device testing.

## Main files

- `index.html` — page shell and navigation
- `projects.js`, `new-projects.js`, `stack-data.js` — project details and dated GitHub activity snapshot
- `workbench-data.js`, `workbench.js`, `workbench.css` — status board, dated notes and experiments
- `console.js`, `console-model.js` — routes, search, bookmarks, and project views
- `settings.js`, `settings-model.js` — preferences and local storage
- `music.js`, `audio-output.js` — radio player and audio controls
- `build-lab.js`, `build-lab-model.js`, `telescope-3d.js`, `observatory.css` — interactive demos and optional planetarium
- `project-network.js`, `atlas-model.js`, `network-view.js`, `constellation.css` — 3D project map and documented connections
- `space-math.js`, `observatory.test.js` — shared projection geometry and tests
- `intro-variants.js`, `intro-scenes.css` — startup animations

Some older files and sections remain in the repository for history, but are not part of the active site.

## Privacy and accuracy

The site does not publish home network details, credentials, private contact information, or backend endpoints. Bookmarks and settings are stored in your browser. If browser storage is blocked, some features work only for the current session.

The activity and language information on the Stack page comes from a dated snapshot of the five original public code projects, not all 12 current code projects or a live GitHub connection. Language counts show which repositories use a language; they do not measure skill. Demo records and maps are clearly labeled as examples or illustrations.

## Deploy

GitHub Pages serves the `main` branch from the repository root over HTTPS. Push changes to `main` to update the live site. No backend, Raspberry Pi hosting, or paid service is needed.
