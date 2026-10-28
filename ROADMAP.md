# Portfolio roadmap

Source: [the project briefs](https://docs.google.com/document/d/1CxZnAtI2rOqjDeZ74t9Nw54bmbV3bsQLh-QtMQVkp8g/edit).

Work through each phase as a usable release, with setup instructions and honest status.

1. **Portfolio foundations — published:** dated build notes with individual links and filters; a shared project status board; a clearly marked experiments page. 136 checks passed; visual browser QA was unavailable for this phase.
2. **Observatory Planner — v0.1 published:** [source](https://github.com/hirsu-dev/observatory-planner) · [browser edition](https://hirsu-dev.github.io/observatory-planner/). Python / FastAPI / SQLite app and browser storage adapter, approximate visibility planning, saved snapshots, observation logs and exports. Eight Python and four JavaScript checks pass; GitHub deployment succeeded.
3. **Pointing Lab — v0.1 published:** continuous azimuth, cable limits, exact angle-box intersections, bounded-rate motion, interactive 3D preview and mission export. Six checks pass.
4. **Lantern — v0.1 published:** synthetic public dashboard, explicit local HTTP/TCP checker, SQLite retention, missing-data coverage and incident history. Eight Python and three JavaScript checks pass.
5. **Remaining ideas — v0.1 published:** Quiet Hours privacy auditor (eight checks), Open Sky catalog explorer (three), Benchbook repair ledger (four), and Fieldnotes offline notebook (six).

## Releases

| App                 | Browser edition                                                         | Repository                                                                |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Observatory Planner | [Open](https://hirsu-dev.github.io/observatory-planner/)        | [Source](https://github.com/hirsu-dev/observatory-planner)        |
| Pointing Lab        | [Open](https://hirsu-dev.github.io/coordinate-motor-simulator/) | [Source](https://github.com/hirsu-dev/coordinate-motor-simulator) |
| Lantern             | [Open](https://hirsu-dev.github.io/homelab-health/)             | [Source](https://github.com/hirsu-dev/homelab-health)             |
| Quiet Hours         | [Open](https://hirsu-dev.github.io/network-privacy-auditor/)    | [Source](https://github.com/hirsu-dev/network-privacy-auditor)    |
| Open Sky            | [Open](https://hirsu-dev.github.io/accessible-star-map/)        | [Source](https://github.com/hirsu-dev/accessible-star-map)        |
| Benchbook           | [Open](https://hirsu-dev.github.io/repair-parts-tracker/)       | [Source](https://github.com/hirsu-dev/repair-parts-tracker)       |
| Fieldnotes          | [Open](https://hirsu-dev.github.io/offline-project-notebook/)   | [Source](https://github.com/hirsu-dev/offline-project-notebook)   |

All seven original app check/deploy workflows succeeded. These are usable first releases, with device review still pending.

## October 27 portfolio refresh

- Added [BIOBUZZ Simulator](https://hirsu-dev.github.io/biobuzz-simulator/) with a project page, original field diagram, build note and JavaScript/robotics Atlas connections. The portfolio now contains 15 projects and 13 public code repositories.
- Featured BIOBUZZ, Hyprland Forge and Fieldnotes on the home page. Added direct browser-app links, availability filtering, update-date/name sorting and repository dates to the archive.
- Refreshed the Stack page from all 13 public project repositories. Exact default-branch commit links and language lists are saved in `repository-data.js`; private repositories and the portfolio are excluded.
- All 144 portfolio checks pass. All eight public browser apps returned HTTP 200. Visual browser controls were unavailable; real-device and screen-reader review remains next.

## Next milestone: real usage and device review

- Visual browser controls were unavailable during this implementation. Verify layout, keyboard focus, text zoom and touch behavior on actual target devices.
- Test Fieldnotes' offline reload and storage quotas in a real browser. Worker-scope and offline-fallback logic are covered by automated checks, but that is not a real offline visit.
- Gather screen-reader feedback on Open Sky. The catalog subset keeps its CC BY-SA 4.0 attribution; the code is MIT.
- Gather practical observing feedback and independently compare astronomy calculations before increasing precision claims or considering hardware control.
- Try the private service checker only against explicitly configured, authorized services. The public dashboard stays synthetic.
- Keep cloud sync, physical motor drivers and optional notifications as separately scoped milestones. No such external connections were configured.

## Phase 1 content

- Edit `projectStatus` in `workbench-data.js` to update normalized status, review date and next step. `projects.js` attaches this data to all project views.
- Add a record to `buildEntries` for a note. Give it a unique URL-safe ID, real date, project ID, goal, change, constraint, takeaway, next step and a labeled image.
- A status review is not a new physical build milestone. Do not fabricate past dates, measurements, photos or hardware results.
- Build-note URLs are `#entry-<id>`. The complete list is `#log`; upcoming work is `#experiments`.
- App experiment states and links derive from `new-projects.js`. Edit `projectStatus` for the next step, and keep the app's README and published capability claims consistent.
