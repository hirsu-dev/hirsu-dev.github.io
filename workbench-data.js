// Editorial review dates, not claims of new physical builds or hardware tests.
export const statusTypes = Object.freeze({
  published: {
    label: "Published",
    description: "Runnable source and setup instructions are public.",
  },
  prototype: {
    label: "Prototype",
    description: "An experiment or design that still needs validation.",
  },
  development: {
    label: "In development",
    description: "Implementation is in progress; readiness is unverified.",
  },
  repair: {
    label: "Under repair",
    description: "Previously worked and currently needs repair.",
  },
  personal: {
    label: "Personal setup",
    description: "Described by the owner; no live telemetry is published.",
  },
});

export const projectStatus = Object.freeze({
  "robo-telescope": {
    state: "repair",
    reviewed: "2026-10-23",
    next: "Inspect the motor, power and control path before attempting another physical pointing test.",
  },
  "nexus-ai": {
    state: "prototype",
    reviewed: "2026-10-23",
    next: "Validate the SwiftUI client against configured local services on an actual iPhone.",
  },
  "pi-homelab": {
    state: "personal",
    reviewed: "2026-10-23",
    next: "Document the service architecture without exposing private network details.",
  },
  "custom-keyboard": {
    state: "prototype",
    reviewed: "2026-10-23",
    next: "Check physical assembly, component clearances and enclosure fit.",
  },
  maintaineros: {
    state: "published",
    reviewed: "2026-10-23",
    next: "Gather feedback on the local triage workflow and capture comparisons.",
  },
  civiclens: {
    state: "published",
    reviewed: "2026-10-23",
    next: "Try a small, source-linked real-record import and document the results.",
  },
  "hyprland-forge": {
    state: "development",
    reviewed: "2026-10-23",
    next: "Validate the desktop configuration and installer on real Arch/Hyprland hardware.",
  },
});

export const buildEntries = Object.freeze([
  {
    id: "telescope-digital-workbench",
    date: "2026-10-23",
    project: "robo-telescope",
    kind: "Software milestone",
    title: "A digital telescope to explore while the real one waits.",
    summary:
      "The portfolio now has a 3D telescope with orbit, focus, part inspection and an exploded assembly.",
    goal: "Make the control idea and the parts easier to explore before the physical telescope is repaired.",
    changed:
      "Added a movable 3D model, camera controls, wireframe and exploded views, and an optional Stellarium Web panel.",
    constraint:
      "The physical telescope is still broken. The model is illustrative, and the external planetarium does not drive it.",
    learned:
      "A useful simulator needs a clear boundary between a visual demonstration and a verified physical result.",
    next: "Add a target-to-movement mission planner, then use documented hardware measurements if a physical model becomes available.",
    image: "assets/telescope.svg?v=8",
    alt: "Illustration of a telescope and motorized mount",
    caption:
      "Project illustration. This is not a build photograph or a measured model.",
  },
  {
    id: "macro-pad-fit-review",
    date: "2026-10-23",
    project: "custom-keyboard",
    kind: "Status review",
    title: "The design is ready. Physical fit is still the next question.",
    summary:
      "A dated review of the six-key macro pad's design files, firmware and enclosure status.",
    goal: "Keep the CAD preview and the actual assembly status easy to tell apart.",
    changed:
      "Recorded the current design-prepared state and linked the existing CAD preview and public source.",
    constraint:
      "This review did not assemble or test the hardware. Nominal CAD fit does not establish real component clearance.",
    learned:
      "The next useful evidence is an assembly check with real parts, not another render.",
    next: "Check clearances, switch alignment, USB access and enclosure fit using the physical parts.",
    image: "assets/nexus-cad.jpg",
    alt: "Existing Onshape CAD preview of the six-key NEXUS macro pad",
    caption: "Actual CAD preview. Physical fit remains unverified.",
  },
  {
    id: "homelab-architecture-review",
    date: "2026-10-23",
    project: "pi-homelab",
    kind: "Status review",
    title: "Useful home services, with a public explanation.",
    summary:
      "Pi-hole, VPN tools and Tailscale are the documented pieces of the Raspberry Pi setup.",
    goal: "Explain the jobs the Pi does without publishing the home network.",
    changed:
      "Recorded the owner-described architecture and a next step for a private health dashboard with a synthetic public demo.",
    constraint:
      "The portfolio does not connect to the Pi, check uptime, scan the network, or expose device information.",
    learned:
      "A public architecture sketch can explain the idea without collecting visitors' or the owner's network data.",
    next: "Build a local health dashboard and show only clearly labeled synthetic service data in the public demo.",
    image: "assets/homelab.svg?v=8",
    alt: "Architecture sketch of a Pi-hole, VPN and Tailscale home lab",
    caption: "Architecture illustration. No live network data.",
  },
]);
export const buildEntryIds = new Set(buildEntries.map((entry) => entry.id));

export const experiments = Object.freeze([
  {
    id: "observatory-planner",
    title: "Observatory Planner",
    state: "Planned",
    project: "robo-telescope",
    purpose:
      "Plan observing sessions, rank visible targets and keep an observation log.",
    next: "Build a Python API, a local database and a JavaScript planning interface.",
    tags: ["Python", "JavaScript", "Astronomy"],
  },
  {
    id: "homelab-health",
    title: "Homelab Health Dashboard",
    state: "Planned",
    project: "pi-homelab",
    purpose:
      "Understand service health and incident history in a private home lab.",
    next: "Start with a synthetic demo, then add a private local checker.",
    tags: ["Python", "Networking", "Raspberry Pi"],
  },
  {
    id: "motor-simulator",
    title: "Coordinate-to-Motor Simulator",
    state: "Planned",
    project: "robo-telescope",
    purpose:
      "Preview a telescope movement, limits and possible collision zones.",
    next: "Define coordinate conventions and verify reference calculations.",
    tags: ["Simulation", "Robotics"],
  },
  {
    id: "privacy-auditor",
    title: "Local Network Privacy Auditor",
    state: "Planned",
    project: "pi-homelab",
    purpose: "Summarize DNS blocking without retaining raw browsing histories.",
    next: "Design an aggregate-only import and retention policy.",
    tags: ["Privacy", "Python"],
  },
  {
    id: "accessible-sky",
    title: "Accessible Star Map",
    state: "Planned",
    project: "robo-telescope",
    purpose:
      "Explore constellations through keyboard controls and equivalent text descriptions.",
    next: "Choose a licensed dataset and build an accessible list first.",
    tags: ["Accessibility", "Astronomy"],
  },
  {
    id: "repair-tracker",
    title: "Repair Log & Parts Tracker",
    state: "Planned",
    project: "custom-keyboard",
    purpose:
      "Keep parts, costs, repair notes and results together across electronics builds.",
    next: "Model projects, repair entries and a simple parts inventory.",
    tags: ["Electronics", "Local tools"],
  },
  {
    id: "project-notebook",
    title: "Offline Project Notebook",
    state: "Planned",
    project: "hyprland-forge",
    purpose:
      "Keep build notes, diagrams and tasks available without a connection.",
    next: "Ship reliable local storage, search and export before adding sync.",
    tags: ["Offline", "JavaScript"],
  },
]);

export function filterEntries({
  project = "all",
  query = "",
  since = "",
} = {}) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return buildEntries
    .filter(
      (e) =>
        (project === "all" || e.project === project) &&
        (!since || e.date >= since) &&
        terms.every((term) =>
          [
            e.title,
            e.summary,
            e.kind,
            e.goal,
            e.changed,
            e.constraint,
            e.learned,
            e.next,
          ]
            .join(" ")
            .toLowerCase()
            .includes(term),
        ),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
