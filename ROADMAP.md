# Portfolio roadmap

Source: [the project briefs](https://docs.google.com/document/d/1CxZnAtI2rOqjDeZ74t9Nw54bmbV3bsQLh-QtMQVkp8g/edit).

Work through each phase as a usable release, with setup instructions and honest status.

1. **Portfolio foundations:** dated build notes with individual links and filters; a shared project status board; a clearly marked experiments page.
2. **Observatory Planner:** separate Python / FastAPI / SQLite app with a JavaScript interface, target management, approximate visibility planning, observing logs and exports.
3. **Coordinate-to-Motor Simulator:** coordinate conventions, reference calculations, movement limits and a visual mission preview. Simulation first.
4. **Homelab Health Dashboard:** synthetic public demo, local checker, history and clear data retention. Keep actual home service access private.
5. **Further apps:** privacy auditor, accessible star map, repair and parts tracker, offline notebook. Complete one release before beginning another.

## Phase 1 content

- Edit `projectStatus` in `workbench-data.js` to update normalized status, review date and next step. `projects.js` attaches this data to all project views.
- Add a record to `buildEntries` for a note. Give it a unique URL-safe ID, real date, project ID, goal, change, constraint, takeaway, next step and a labeled image.
- A status review is not a new physical build milestone. Do not fabricate past dates, measurements, photos or hardware results.
- Build-note URLs are `#entry-<id>`. The complete list is `#log`; upcoming work is `#experiments`.
- Edit `experiments` when a prototype becomes runnable. Link its repository only after it exists. Update the state and next step truthfully.
