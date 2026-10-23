# hirsu — from code to the real world

**Live site:** [hrushikbarani-hub.github.io](https://hrushikbarani-hub.github.io/)

This is my personal portfolio and project hub. It is a static website hosted on GitHub Pages. It has no backend, account system, paid domain, analytics, or runtime npm dependencies.

The site includes seven projects, several interface layouts, a searchable project archive, an interactive project map, accessibility settings, and an optional music player. Most content and settings stay in your browser. The music player loads audio only after you press Play.

## Projects

The portfolio covers five public code projects and two personal builds:

- **Custom Keyboard / NEXUS Macro Pad:** a six-key macro pad with an OLED screen. The PCB, case, and firmware are in progress; physical fit has not been confirmed.
- **NEXUS Mobile:** an experimental iOS companion app for local models and home services. It does not train its own AI model.
- **Hyprland Forge:** a Linux setup project. Real-hardware testing is still pending.
- **MaintainerOS:** a local app that helps organize public GitHub issues and pull requests.
- **CivicLens:** a local app for tracking public decisions and linking them to their sources.
- **Robo Telescope:** a telescope project that is currently under repair. The site demo does not control real hardware.
- **Raspberry Pi Home Lab:** a home setup with services such as Pi-hole, Tailscale, and VPN tools. The site does not connect to or scan the network.

The portfolio labels illustrations, CAD previews, screenshots, and demos so they are not mistaken for photos or verified hardware. Its project map is an illustration, not live network or astronomy data.

## Using the site

- Browse projects by searching, filtering, opening, or saving them in your browser.
- Pick an interface layout, color palette, visual effects, and startup animation in **Settings**.
- Use the project map to explore how projects relate.
- Use keyboard controls and accessibility options such as reduced motion, larger text, and high contrast.
- Open the **Build Lab** to try small interactive demos. They do not control real devices.
- Use the optional **Radio** player to play the site's music tracks. Playback starts only after you choose Play.

The site makes no runtime API calls for portfolio data. Radio is the exception: it loads the selected audio after you press Play. Audio files are supplied by the owner. See [the audio credits and usage notice](assets/audio/README.md). The site's code license does not give visitors permission to reuse the music.

## Run it locally

You need Node.js 22 or newer for the development checks. The site itself is static and does not need an npm install to serve.

```powershell
npm ci
npm run check
python -m http.server 8130 --bind 127.0.0.1
```

Then open [http://127.0.0.1:8130/](http://127.0.0.1:8130/). The site uses JavaScript modules, so serve it over HTTP instead of opening `index.html` directly.

Automated checks cover project data, routes, settings, keyboard controls, animations, and the interactive demos. They do not replace checking the site in a real browser. Mobile Safari and lock-screen audio behavior have not been fully tested.

## Main files

- `index.html` — page shell and navigation
- `projects.js`, `stack-data.js` — project details and dated GitHub activity snapshot
- `console.js`, `console-model.js` — routes, search, bookmarks, and project views
- `settings.js`, `settings-model.js` — preferences and local storage
- `music.js`, `audio-output.js` — radio player and audio controls
- `build-lab.js`, `build-lab-model.js` — interactive demos
- `project-network.js`, `sky-model.js` — project map
- `intro-variants.js`, `intro-scenes.css` — startup animations

Some older files and sections remain in the repository for history, but are not part of the active site.

## Privacy and accuracy

The site does not publish home network details, credentials, private contact information, or backend endpoints. Bookmarks and settings are stored in your browser. If browser storage is blocked, some features work only for the current session.

The activity and language information on the site comes from a dated snapshot, not a live GitHub connection. Language counts show which repositories use a language; they do not measure skill. Demo records and maps are clearly labeled as examples or illustrations.

## Deploy

GitHub Pages serves the `main` branch from the repository root over HTTPS. Push changes to `main` to update the live site. No backend, Raspberry Pi hosting, or paid service is needed.
