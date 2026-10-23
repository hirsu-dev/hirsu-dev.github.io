export const newProjects = [
  {
    id: "observatory-planner",
    title: "Observatory Planner",
    subtitle: "Make room for a night outside.",
    category: "ASTRONOMY / PLANNING",
    tags: ["Python", "FastAPI", "JavaScript", "SQLite"],
    description:
      "Plan observing windows, compare approximate target altitude and keep a local field journal.",
    features: [
      "UTC planning with approximate altitude and darkness estimates",
      "Saved target-coordinate snapshots and observation outcomes",
      "Local SQLite app, browser edition and JSON/CSV exports",
    ],
    progress:
      "Version 0.1 is runnable locally and as a browser edition. Calculations are approximate and do not control hardware. Eight Python and four JavaScript checks pass.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "observatory-planner",
    image: "assets/apps/observatory-planner.svg",
    alt: "Original interface diagram for Observatory Planner",
    caption: "Original app diagram · not a screenshot",
    overview:
      "Plan observing windows, compare approximate target altitude and keep a local field journal.",
    source: "https://github.com/hrushikbarani-hub/observatory-planner",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/observatory-planner/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
  {
    id: "coordinate-motor-simulator",
    title: "Pointing Lab",
    subtitle: "Think through the movement.",
    category: "ROBOTICS / SIMULATION",
    tags: ["JavaScript", "3D", "Motion planning", "Astronomy"],
    description:
      "Simulate telescope mount paths, cable travel limits and angle-space exclusion zones before touching a motor.",
    features: [
      "Continuous azimuth limits and three candidate path strategies",
      "Exact segment/box checks and peak-rate-bounded smooth motion",
      "Interactive 3D preview, manual scrub and JSON mission export",
    ],
    progress:
      "Version 0.1 is a browser simulator. Its geometry and constraints are illustrative, and no commands reach motors. Six checks cover planning, rate limits and the actual control flow.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "coordinate-motor-simulator",
    image: "assets/apps/coordinate-motor-simulator.svg",
    alt: "Original interface diagram for Pointing Lab",
    caption: "Original app diagram · not a screenshot",
    overview:
      "Simulate telescope mount paths, cable travel limits and angle-space exclusion zones before touching a motor.",
    source: "https://github.com/hrushikbarani-hub/coordinate-motor-simulator",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/coordinate-motor-simulator/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
  {
    id: "homelab-health",
    title: "Lantern / Homelab Health",
    subtitle: "See the signal. Notice the gaps.",
    category: "HOMELAB / OBSERVABILITY",
    tags: ["Python", "FastAPI", "JavaScript", "SQLite", "HTTP/TCP"],
    description:
      "A private service dashboard with incident history, connection latency and honest sample coverage.",
    features: [
      "Explicit local HTTP/TCP checks with timeouts and allowed hosts",
      "Unknown/stale states, incident history, P95 latency and retention",
      "Synthetic public demo with no connection to the actual home lab",
    ],
    progress:
      "Version 0.1 includes a loopback Python app and a synthetic browser demo. Eight Python and three JavaScript checks pass. Real service checks require an explicit private configuration.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "homelab-health",
    image: "assets/apps/homelab-health.svg",
    alt: "Original interface diagram for Lantern / Homelab Health",
    caption: "Original app diagram · not a screenshot",
    overview:
      "A private service dashboard with incident history, connection latency and honest sample coverage.",
    source: "https://github.com/hrushikbarani-hub/homelab-health",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/homelab-health/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
  {
    id: "network-privacy-auditor",
    title: "Quiet Hours / Privacy Auditor",
    subtitle: "See the pattern. Keep the details private.",
    category: "PRIVACY / RASPBERRY PI",
    tags: ["Python", "JavaScript", "SQLite (read-only)", "Pi-hole", "CSV"],
    description:
      "Audit DNS blocking from local files while retaining aggregate counts instead of browsing histories.",
    features: [
      "Local CSV processing and a read-only Pi-hole database adapter",
      "Daily blocking totals, separate unknown outcomes and retention",
      "Aggregate-only JSON exports with no domains or device identifiers",
    ],
    progress:
      "Version 0.1 runs in the browser and through a standard-library Python CLI. Eight checks cover privacy, retention, read-only input and the browser flow. Source files remain untouched.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "network-privacy-auditor",
    image: "assets/apps/network-privacy-auditor.svg",
    alt: "Original interface diagram for Quiet Hours / Privacy Auditor",
    caption: "Original app diagram · not a screenshot",
    overview:
      "Audit DNS blocking from local files while retaining aggregate counts instead of browsing histories.",
    source: "https://github.com/hrushikbarani-hub/network-privacy-auditor",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/network-privacy-auditor/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
  {
    id: "accessible-star-map",
    title: "Open Sky / Accessible Star Map",
    subtitle: "The sky belongs to everyone.",
    category: "ASTRONOMY / ACCESSIBILITY",
    tags: ["JavaScript", "SVG", "HYG", "Accessibility"],
    description:
      "Explore a licensed bright-star catalog through a searchable list, a chart, or a text-only view.",
    features: [
      "144 HYG named stars, magnitude filters and 47 constellation groups",
      "Text-only mode, contrast controls, saved IDs and keyboard selection",
      "Attributed CSV exports and a pinned CC BY-SA 4.0 data subset",
    ],
    progress:
      "Version 0.1 is a catalog explorer with J2000 coordinates, not a current-horizon planetarium. Three checks pass. Real screen-reader and visual browser QA remain unverified.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "accessible-star-map",
    image: "assets/apps/accessible-star-map.svg",
    alt: "Original interface diagram for Open Sky / Accessible Star Map",
    caption: "Original app diagram · not a screenshot",
    overview:
      "Explore a licensed bright-star catalog through a searchable list, a chart, or a text-only view.",
    source: "https://github.com/hrushikbarani-hub/accessible-star-map",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/accessible-star-map/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
  {
    id: "repair-parts-tracker",
    title: "Benchbook / Repair & Parts",
    subtitle: "Keep track of the fix.",
    category: "ELECTRONICS / LOCAL TOOLS",
    tags: ["JavaScript", "IndexedDB", "Electronics", "Inventory"],
    description:
      "Keep repair history, test outcomes, wiring notes and parts stock together in a local workspace.",
    features: [
      "Transactional stock consumption and preserved part-value snapshots",
      "Build, outcome and text filters with explicit adjustment history",
      "Complete JSON backups and validated atomic restore",
    ],
    progress:
      "Version 0.1 is a local browser app. Four checks cover stock rules, concurrent writes, rollback and real form workflows. It starts empty and makes no claims about physical test results.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "repair-parts-tracker",
    image: "assets/apps/repair-parts-tracker.svg",
    alt: "Original interface diagram for Benchbook / Repair & Parts",
    caption: "Original app diagram · not a screenshot",
    overview:
      "Keep repair history, test outcomes, wiring notes and parts stock together in a local workspace.",
    source: "https://github.com/hrushikbarani-hub/repair-parts-tracker",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/repair-parts-tracker/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
  {
    id: "offline-project-notebook",
    title: "Fieldnotes / Offline Notebook",
    subtitle: "A place for the work in progress.",
    category: "PROJECT NOTES / OFFLINE",
    tags: ["JavaScript", "IndexedDB", "Service Worker", "Offline"],
    description:
      "Keep project notes, tasks, photos and wiring ideas locally, with backups and an offline app cache.",
    features: [
      "Local notes, checklists and a keyboard-movable wiring-idea board",
      "Photo attachments and complete transactional backups",
      "Stale-edit protection and a scoped offline service worker",
    ],
    progress:
      "Version 0.1 has six checks for records, photos, conflicts, editor flow and worker logic. Actual offline reload and visual device QA remain unverified. No cloud sync is included.",
    filters: ["software"],
    status: "Prototype · v0.1",
    artwork: "offline-project-notebook",
    image: "assets/apps/offline-project-notebook.svg",
    alt: "Original interface diagram for Fieldnotes / Offline Notebook",
    caption: "Original app diagram · not a screenshot",
    overview:
      "Keep project notes, tasks, photos and wiring ideas locally, with backups and an offline app cache.",
    source: "https://github.com/hrushikbarani-hub/offline-project-notebook",
    sourceLabel: "Source & local setup",
    demo: "https://hrushikbarani-hub.github.io/offline-project-notebook/",
    evidence:
      "Published version 0.1 README, source, local checks and GitHub deployment.",
  },
];
