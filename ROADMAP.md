# Portfolio roadmap

Source: [the project briefs](https://docs.google.com/document/d/1CxZnAtI2rOqjDeZ74t9Nw54bmbV3bsQLh-QtMQVkp8g/edit).

Work through each phase as a usable release, with setup instructions and honest status.

1. **Portfolio foundations — published:** dated build notes with individual links and filters; a shared project status board; a clearly marked experiments page. 136 checks passed; visual browser QA was unavailable for this phase.
2. **Observatory Planner — v0.1 published:** [source](https://github.com/hrushikbarani-hub/observatory-planner) · [browser edition](https://hrushikbarani-hub.github.io/observatory-planner/). Python / FastAPI / SQLite app and browser storage adapter, approximate visibility planning, saved snapshots, observation logs and exports. Eight Python and four JavaScript checks pass; GitHub deployment succeeded.
3. **Pointing Lab — v0.1 published:** continuous azimuth, cable limits, exact angle-box intersections, bounded-rate motion, interactive 3D preview and mission export. Six checks pass.
4. **Lantern — v0.1 published:** synthetic public dashboard, explicit local HTTP/TCP checker, SQLite retention, missing-data coverage and incident history. Eight Python and three JavaScript checks pass.
5. **Remaining ideas — v0.1 published:** Quiet Hours privacy auditor (eight checks), Open Sky catalog explorer (three), Benchbook repair ledger (four), and Fieldnotes offline notebook (six).

## Releases

| App                 | Browser edition                                                         | Repository                                                                |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Observatory Planner | [Open](https://hrushikbarani-hub.github.io/observatory-planner/)        | [Source](https://github.com/hrushikbarani-hub/observatory-planner)        |
| Pointing Lab        | [Open](https://hrushikbarani-hub.github.io/coordinate-motor-simulator/) | [Source](https://github.com/hrushikbarani-hub/coordinate-motor-simulator) |
| Lantern             | [Open](https://hrushikbarani-hub.github.io/homelab-health/)             | [Source](https://github.com/hrushikbarani-hub/homelab-health)             |
| Quiet Hours         | [Open](https://hrushikbarani-hub.github.io/network-privacy-auditor/)    | [Source](https://github.com/hrushikbarani-hub/network-privacy-auditor)    |
| Open Sky            | [Open](https://hrushikbarani-hub.github.io/accessible-star-map/)        | [Source](https://github.com/hrushikbarani-hub/accessible-star-map)        |
| Benchbook           | [Open](https://hrushikbarani-hub.github.io/repair-parts-tracker/)       | [Source](https://github.com/hrushikbarani-hub/repair-parts-tracker)       |
| Fieldnotes          | [Open](https://hrushikbarani-hub.github.io/offline-project-notebook/)   | [Source](https://github.com/hrushikbarani-hub/offline-project-notebook)   |

All seven GitHub check/deploy workflows succeeded. The portfolio now includes 14 projects, 12 public code repositories, a 14-constellation Atlas, searchable status/build notes and working prototype links. It has 138 passing checks; the app repositories have 50 more. These are usable first releases, not a claim of completed real-device testing.

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
