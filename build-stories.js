import { escapeHTML as esc } from "./console-model.js?v=28";

export const featuredProjectIds = Object.freeze([
  "maintaineros",
  "civiclens",
  "biobuzz-simulator",
  "hyprland-forge",
  "robo-telescope",
]);

export const buildStories = Object.freeze({
  "robo-telescope": {
    title: "The telescope I wanted was too expensive.",
    origin:
      "I saw motorized telescopes online, but they were really expensive. I wanted to see if I could build one myself. That became Robo Telescope: enter sky coordinates on my computer and have motors turn the telescope toward them.",
    decision:
      "Use computer-entered coordinates to command the motors. The interesting part was connecting a number on a screen to something that actually moved.",
    lesson:
      "Moving the mount and pointing accurately are different milestones. A repair needs repeatable pointing checks before this can be called a working telescope again.",
    works:
      "It previously moved toward entered coordinates, according to my build account. It is currently broken.",
    checked:
      "My description of the build and its repair status; no fresh physical test or pointing-error measurement.",
    estimated:
      "The picture is an illustration. No measured CAD model, tracking accuracy or hardware telemetry is shown.",
    next: "Find the fault, restore repeatable motor movement, then record a real build photo and a target-to-pointing test.",
    provenance:
      "Origin and status supplied by Hirsu. Motivation added November 5, 2026; previous working/broken status supplied October 2026.",
    links: [],
  },
  maintaineros: {
    title: "A missing issue is not necessarily a closed issue.",
    origin:
      "A repository can have a long issue list without a clear next task. MaintainerOS turns a bounded activity snapshot into a local queue, with the evidence behind each suggestion.",
    decision:
      "Store the capture policy with each snapshot instead of rescoring old history after a settings change. A comparison can then explain when its two scores were produced under different rules.",
    lesson:
      "Sampling changes the meaning of a comparison. Items missing from a later sample are labeled no longer observed, rather than closed.",
    works:
      "Public-repository imports, dated captures, policy settings, comparisons, persistent action states and exports.",
    checked:
      "22 pytest checks passed on Windows, Python 3.12.14 and SQLite 3.53.1 on November 5, 2026. Network behavior is mocked in the automated tests.",
    estimated:
      "The score is a transparent heuristic. The screenshot contains fictional demo projects; it is not evidence of real maintainers using the app.",
    next: "Try the queue against real maintainer workflows and check whether the suggested tasks are useful. Large and rate-limited repositories still need broader evaluation.",
    provenance:
      "Build decisions are grounded in comparison.py, snapshot storage and the policy regression tests. This is not a claim of independent user validation.",
    links: [
      [
        "Comparison implementation",
        "https://github.com/hirsu-dev/maintaineros/blob/fb1a2b68e30dde5b1879ace5c2c8c55f833b662e/maintaineros/comparison.py",
      ],
      [
        "Policy regression tests",
        "https://github.com/hirsu-dev/maintaineros/blob/fb1a2b68e30dde5b1879ace5c2c8c55f833b662e/tests/test_policy.py",
      ],
      [
        "Reproduce the checks",
        "https://github.com/hirsu-dev/maintaineros/blob/main/docs/build-note.md",
      ],
    ],
  },
  civiclens: {
    title: "Faster search, with the same literal results.",
    origin:
      "A local decision can span several meeting packets. CivicLens keeps each observation, source excerpt and revision together so a reader can follow that trail.",
    decision:
      "Use SQLite FTS5 trigrams for longer search terms and substring checks for short terms. Preserve literal matching rather than silently introducing a new query language or relevance order.",
    lesson:
      "An index is only an improvement if it keeps the original search contract. Regression tests compare indexed results with literal matching and verify migration without losing revisions.",
    works:
      "Source-linked timelines, literal search and filters, validated imports, revisions, saved searches and CSV export.",
    checked:
      "26 pytest checks passed on Windows, Python 3.12.14 / SQLite 3.53.1 on November 5, 2026. A 10,000-record synthetic benchmark returned the same 10 matches: median scan 236.410 ms, indexed 6.166 ms over seven runs.",
    estimated:
      "The benchmark and Sample City screenshots use synthetic records. Those timings describe this machine and query, not real municipal workloads or a universal speedup.",
    next: "Import a real public meeting packet, verify each source and reference, and test search with readers who did not build the app.",
    provenance:
      "The benchmark creates a temporary database, compares result IDs and counts, and removes it afterward. Existing records are not used.",
    links: [
      [
        "Search regression tests",
        "https://github.com/hirsu-dev/civiclens/blob/dae5e4e21b9e48bde08666b06a33f7b19cd755d4/tests/test_search_index.py",
      ],
      [
        "Reproducible benchmark",
        "https://github.com/hirsu-dev/civiclens/blob/dae5e4e21b9e48bde08666b06a33f7b19cd755d4/scripts/benchmark_search.py",
      ],
      [
        "Run conditions and results",
        "https://github.com/hirsu-dev/civiclens/blob/main/docs/build-note.md",
      ],
    ],
  },
  "biobuzz-simulator": {
    title: "The physics clock should not depend on your screen.",
    origin:
      "BIOBUZZ is a way to practice driving and match decisions in a browser, with a robot and field available without a full physical setup.",
    decision:
      "Step Rapier at 120 Hz and interpolate the rendered motion. The motion tests compare 30, 60 and 144 Hz displays and bound catch-up after a long frame.",
    lesson:
      "Smooth rendering and repeatable physics are separate jobs. A higher refresh rate should not make the same robot input cover a different distance.",
    works:
      "Fifteen robot presets, singleplayer practice and matches, local replays, custom builds and private host-browser multiplayer rooms.",
    checked:
      "47 automated Node.js checks passed on Windows on November 5, 2026. The public solo-practice screen was also opened in a desktop browser for the screenshot shown here.",
    estimated:
      "Physics, AI and scoring are practice approximations. Java drafts are editable but are not executed. Phone-sized browser checks are not physical iPhone or Android tests; multiplayer may fail on networks requiring TURN.",
    next: "Measure sustained performance and multitouch behavior on real phones, and compare practice behavior with a physical robot.",
    provenance:
      "The image is a real browser capture of the running simulation, not a photograph of a physical field. No calibrated hardware result is implied.",
    links: [
      [
        "Refresh-rate regression tests",
        "https://github.com/hirsu-dev/biobuzz-simulator/blob/c6cdcd54a4bde83f6fdbfc7cd911c3f76b40dcf4/tests/motion.test.mjs",
      ],
      [
        "Build note and test command",
        "https://github.com/hirsu-dev/biobuzz-simulator/blob/main/docs/build-note.md",
      ],
    ],
  },
  "hyprland-forge": {
    title: "A coherent desktop is more than a color preset.",
    origin:
      "Forge brings a personal Arch/Hyprland desktop together: a Quickshell panel, launcher, display controls, clipboard and setup tools for an AMD/NVIDIA laptop.",
    decision:
      "Generate shared theme values for the shell, terminal and launcher from one palette, with bounded interface options and restore paths.",
    lesson:
      "A theme needs consistent behavior as well as consistent colors. The theme tests check generated files, invalid accents, preserved settings and rollback behavior.",
    works:
      "The repository contains the desktop configuration, theme generator and setup/helper tools. It remains in development.",
    checked:
      "The portable theme suite ran on Windows / Python 3.12.14 on November 5, 2026: 19 passed, 2 skipped. This review did not start Hyprland or run the installer.",
    estimated:
      "The desktop image is an illustration. Earlier test-environment checks do not establish target-laptop hardware support or daily-use readiness.",
    next: "Run the desktop on the target AMD/NVIDIA laptop and record display, suspend, scaling and restore behavior with an actual session screenshot.",
    provenance:
      "Theme checks are portable unit tests. Linux session, installer and physical-laptop validation remain separate.",
    links: [
      [
        "Theme tests",
        "https://github.com/hirsu-dev/hyprland-forge/blob/88e2a25bc16ec236f014b391599225e93b5b1e1a/tests/test_theme.py",
      ],
      [
        "Target and setup manifest",
        "https://github.com/hirsu-dev/hyprland-forge/blob/88e2a25bc16ec236f014b391599225e93b5b1e1a/project.json",
      ],
      [
        "Review conditions",
        "https://github.com/hirsu-dev/hyprland-forge/blob/main/docs/build-note.md",
      ],
    ],
  },
});

const progressNotes = {
  "custom-keyboard": [
    "Nominal fit is not physical fit.",
    "The CAD preview makes the six-key enclosure easier to inspect, but component clearance and assembly still need a physical check. A printed case and measured fit photos are the next evidence to add.",
  ],
  "pi-homelab": [
    "A useful home service can stay private.",
    "This Pi setup centers on Pi-hole, VPN and Tailscale. The diagram explains those roles without exposing a private network or pretending to show live service health.",
  ],
  "nexus-ai": [
    "The interface and the model are different parts.",
    "The SwiftUI client selects existing AI models and calls configured home services. A screenshot of the interface would not demonstrate model training, backend availability or working relay control.",
  ],
  "observatory-planner": [
    "Save the coordinates with the observation.",
    "An observing note needs the target coordinates that were used when it was planned. Altitude and darkness estimates remain approximate; they do not point a physical telescope.",
  ],
  "coordinate-motor-simulator": [
    "A short path can still cross a limit.",
    "The preview compares movement paths against angle-space travel and exclusion constraints. Geometric checks in a simulation do not establish real motor clearance or collision safety.",
  ],
  "homelab-health": [
    "Missing samples are part of the result.",
    "The dashboard reports sample coverage alongside service health, so an unobserved period is not silently treated as uptime. The browser edition uses synthetic services, not a connection to my home network.",
  ],
  "network-privacy-auditor": [
    "Keep the summary without keeping browsing history.",
    "The import path produces aggregate DNS blocking counts. The remaining practical test is to check those summaries against a real Pi-hole export without publishing private query logs.",
  ],
  "accessible-star-map": [
    "A chart needs an equivalent way to read it.",
    "A searchable list and text view make the bright-star catalog usable beyond the visual map. Catalog calculations and keyboard checks still need feedback from screen-reader users.",
  ],
  "repair-parts-tracker": [
    "A repair entry should explain the test.",
    "Parts stock alone does not explain whether a repair helped. The local workspace keeps outcomes and wiring notes beside the repair history; real bench use and backup recovery need more review.",
  ],
  "offline-project-notebook": [
    "Local storage makes backups part of the workflow.",
    "Keeping notes on the device helps offline work, but browser storage can be cleared. Export and recovery need checking with actual project notes before treating it as the only copy.",
  ],
};

export function buildNoteContent(p, compact = false) {
  const s = buildStories[p.id];
  if (!s) {
    const note = progressNotes[p.id];
    return note
      ? `<section class="build-story panel" data-build-story="${p.id}"><p class="eyebrow">IN PROGRESS / ENGINEERING NOTE</p><h2>${esc(note[0])}</h2><p>${esc(note[1])}</p><p class="fineprint">Current state: ${esc(p.status)}. Checks for this project were not rerun in the November 5 review.</p></section>`
      : "";
  }
  const heading = compact ? "h4" : "h2";
  const text = `<p class="eyebrow">BUILD NOTE${p.id === "robo-telescope" ? " / MY STARTING POINT" : " / A DECISION IN THE CODE"}</p><${heading}>${esc(s.title)}</${heading}><p>${esc(s.origin)}</p><dl class="story-decisions"><div><dt>${p.id === "robo-telescope" ? "The approach" : "Design decision"}</dt><dd>${esc(s.decision)}</dd></div><div><dt>What this makes clear</dt><dd>${esc(s.lesson)}</dd></div><div><dt>Next step</dt><dd>${esc(s.next)}</dd></div></dl>`;
  if (compact)
    return `<section class="build-story" data-build-story="${p.id}">${text}<a class="od-text-link" href="#${p.id}">TESTS & EVIDENCE ↗</a></section>`;
  return `<section class="build-story panel" data-build-story="${p.id}">${text}<h3>Working, checked, still uncertain</h3><dl class="story-evidence"><div><dt>Works now</dt><dd>${esc(s.works)}</dd></div><div><dt>Checks and environment</dt><dd>${esc(s.checked)}</dd></div><div><dt>Simulation / limits</dt><dd>${esc(s.estimated)}</dd></div></dl><p class="fineprint">${esc(s.provenance)}</p><nav class="story-sources" aria-label="${esc(p.title)} evidence">${s.links.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join("")}</nav></section>`;
}
