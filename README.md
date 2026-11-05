# hirsu — code, circuits and the work behind them

[Live portfolio](https://hirsu-dev.github.io/)

A personal portfolio with five featured builds and ten smaller projects in progress. The full archive keeps all 15 projects, source links, screenshots, build notes, a stack overview and a project map. It runs on free GitHub Pages without a backend or account.

Settings → Customize has five layouts: Overdrive, Netrunner, Relic, Switchboard and Orbit. Orbit uses a thumbnail project wheel, a terminal-style reader and a branching project map. It takes visual inspiration from [Hancore](https://hancore.dev/site/), with original code and my own project content.

Featured build notes explain a project-specific decision, what was checked and what is still unfinished. Robo Telescope includes my reason for starting it: the motorized telescopes I saw online were expensive, so I wanted to build one myself.

The Build Lab, experiments page, music player and hosted audio files have been removed. The actual telescope, Pi and software projects remain. Old utility links lead back to the archive or home.

## Browser apps

- [BIOBUZZ Simulator](https://hirsu-dev.github.io/biobuzz-simulator/) — 3D robot practice
- [Observatory Planner](https://hirsu-dev.github.io/observatory-planner/) — approximate observing windows and notes
- [Pointing Lab](https://hirsu-dev.github.io/coordinate-motor-simulator/) — illustrative mount-path simulation
- [Lantern](https://hirsu-dev.github.io/homelab-health/) — synthetic service-health demo
- [Quiet Hours](https://hirsu-dev.github.io/network-privacy-auditor/) — aggregate DNS reports
- [Open Sky](https://hirsu-dev.github.io/accessible-star-map/) — accessible bright-star catalog
- [Benchbook](https://hirsu-dev.github.io/repair-parts-tracker/) — repair history and parts
- [Fieldnotes](https://hirsu-dev.github.io/offline-project-notebook/) — local project notes and backups

Project pages keep their source, current state and limitations. The physical telescope is under repair. CAD fit and target-laptop validation remain pending where noted. Media captions distinguish screenshots, CAD and illustrations.

## Run and check

Development checks use Node.js 22 or newer:

```sh
npm ci
npm run check
npx http-server . -p 8134 -a 127.0.0.1 -c-1
```

Open the printed local URL. Serve over HTTP because the site uses JavaScript modules. There is no runtime npm dependency.

Checks cover project data, routes, saved preferences, startup, layout switching, gallery and filter controls, keyboard navigation, animation cleanup and the map. Screen-reader and physical-phone review are separate checks.

## Grounded content and data

`projects.js` and `new-projects.js` hold project details. `repository-data.js` is a public GitHub snapshot dated October 27, 2026. It includes the 13 public project repositories, excluding this portfolio and private repositories. Language lists come from GitHub's `/languages` endpoint; activity links point to exact default-branch commits. Documentation and cleanup commits count as activity. Visitors make no GitHub API requests.

The map shows project relationships. It is not live device data or an astronomical chart. Saved projects and layout choices stay in this browser. There is no first-party analytics, cloud sync or private-network connection.

The city photograph is [Shinjuku by Night by Fboas](https://commons.wikimedia.org/wiki/File:Shinjuku_by_Night.jpg), used under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Credits appear beside the image. Other project media keeps its source notes and captions.

## Deploy

GitHub Pages serves the root of `main`. Push changes to update the live site.
