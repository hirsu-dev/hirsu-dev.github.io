# hirsu — personal workshop

A static portfolio for Hrushi's software, electronics, robotic telescope, Raspberry Pi home lab, and personal AI experiments. Designed for free GitHub Pages hosting at `https://hrushikbarani-hub.github.io/`. It does not need a Raspberry Pi or a Python backend.

## Included

- All five public project repositories found on October 20, 2026: custom-keyboard, nexus-mobile, hyprland-forge, maintaineros, civiclens.
- Robo Telescope and the Raspberry Pi home lab, with descriptions supplied by Hrushi.
- Search and category filters, shareable project details, keyboard-friendly dialogs, and a saved light/dark theme.
- No analytics, remote fonts, API keys, login, or build dependencies.

## Edit

Update project descriptions, status, source links, and artwork in `projects.js`. General text is in `index.html`; appearance is in `styles.css`. After adding projects, update the initial filter count, fallback text, and repository/build count in `app.js`. Push to `main` to publish changes once Pages is configured.

## Run locally

```sh
python -m http.server 8130 --bind 127.0.0.1
```

Open `http://127.0.0.1:8130/`. A local server is needed for ES modules. Optional JavaScript syntax check: `npm run check` (Node.js required; no install step).

## Publish on GitHub Pages

Create the public repository `hrushikbarani-hub.github.io`, push this folder to its `main` branch, then select **Settings → Pages → Deploy from a branch → main → /(root)**. The `.nojekyll` file publishes the static files directly. No paid domain or subscription is needed for the provided `github.io` address.

## Content and images

Project claims are based on public source files and Hrushi's descriptions. NEXUS is an experimental client using existing AI models, not a claim of training a foundation model or running inference on the Pi. Robo Telescope previously worked and is currently under repair. The macro pad has design files, with physical fit/assembly/testing pending. Hyprland Forge is in development, with hardware validation pending. MaintainerOS and CivicLens are runnable local apps, and are not deployed as backend services by this portfolio.

The telescope, phone, network and desktop images are original SVG illustrations, labeled as illustrations. `assets/nexus-cad.jpg` is the public CAD preview from custom-keyboard/photos/fit-v1.2.jpg, not a physical device photograph. App screenshots come from the corresponding public project repositories and include labeled fictional demo records. No private network details, contact information, or credentials are published.
