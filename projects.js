import { projectStatus } from "./workbench-data.js?v=23";
import { newProjects } from "./new-projects.js?v=23";

export const projects = [
  {
    id: "robo-telescope",
    title: "Robo Telescope",
    subtitle: "A little closer to the stars.",
    category: "ROBOTICS / ASTRONOMY",
    filters: ["hardware"],
    status: "Under repair",
    statusClass: "repair",
    artwork: "telescope",
    image: "assets/telescope.svg?v=8",
    alt: "Illustration of a telescope and motorized mount, not a photograph of the build",
    caption: "Project illustration",
    description:
      "Enter sky coordinates on a computer. Let motors turn the telescope toward that part of the sky.",
    tags: ["Motor control", "Astronomy", "Robotics"],
    overview:
      "Robo Telescope connects commands on a computer to physical motion. Entering coordinates in the sky directed motors to turn the telescope toward that location.",
    features: [
      "Computer input for sky coordinates",
      "Motor-driven telescope positioning",
      "A hands-on link between software, electronics, and astronomy",
    ],
    progress:
      "This build previously worked and is currently broken. It needs repair before it can point toward entered coordinates again.",
    source: null,
    sourceLabel: null,
    evidence:
      "Project description and current status supplied by Hrushi, October 2026.",
  },
  {
    id: "nexus-ai",
    title: "NEXUS Mobile + AI",
    subtitle: "My home stack, in my pocket.",
    category: "PERSONAL AI / MOBILE",
    filters: ["software", "ai"],
    status: "Experimental",
    artwork: "nexus",
    image: "assets/nexus.svg?v=8",
    alt: "Illustrated mobile interface connecting a personal AI assistant and home services",
    caption: "Interface illustration · not a live connection",
    description:
      "A SwiftUI companion for a personal AI interface, home services, and a local NEXUS stack.",
    tags: ["SwiftUI", "Local AI", "Home services"],
    overview:
      "An experimental native iOS companion for NEXUS. The public source includes a personal AI chat interface with model selection alongside controls and status views for a home setup.",
    features: [
      "Personal AI chat interface and model selection",
      "Views for Tailscale, Jellyfin, and Pi-hole",
      "PC power controls that depend on configured local relay endpoints",
    ],
    progress:
      "Experimental SwiftUI source. Running it requires Xcode, signing, and the corresponding backend services. The AI interface selects existing models, with computation provided by the local service.",
    source: "https://github.com/hrushikbarani-hub/nexus-mobile",
    sourceLabel: "Explore the repository",
    evidence: "Public README and ContentView.swift in nexus-mobile.",
  },
  {
    id: "pi-homelab",
    title: "Raspberry Pi Home Lab",
    subtitle: "Small computer. Useful jobs.",
    category: "RASPBERRY PI / NETWORKING",
    filters: ["homelab"],
    status: "Personal setup",
    artwork: "homelab",
    image: "assets/homelab.svg?v=8",
    alt: "Illustrated diagram of a Raspberry Pi home lab with Pi-hole, VPN, and Tailscale",
    caption: "Architecture sketch · no live network data",
    description:
      "A home Raspberry Pi setup for Pi-hole ad blocking, VPN, and Tailscale remote access.",
    tags: ["Raspberry Pi", "Pi-hole", "Tailscale", "VPN"],
    overview:
      "A Raspberry Pi home lab built around practical network services: Pi-hole for ad blocking, VPN connectivity, and Tailscale for remote access.",
    features: [
      "Pi-hole network ad blocking",
      "VPN and Tailscale remote access",
      "A small home server for experimenting with connected services",
    ],
    progress:
      "A personal setup centered on network ad blocking and remote access. The diagram shows the main services in the home lab.",
    source: null,
    sourceLabel: null,
    evidence: "Home lab description supplied by Hrushi, October 2026.",
  },
  {
    id: "custom-keyboard",
    title: "NEXUS Macro Pad",
    subtitle: "Six keys. A whole lot of shortcuts.",
    category: "CUSTOM ELECTRONICS / CAD",
    filters: ["hardware"],
    status: "Design prepared",
    artwork: "macro",
    image: "assets/nexus-cad.jpg",
    alt: "Onshape CAD preview of the NEXUS six-key macro pad enclosure and nominal electronics fit",
    caption: "Actual CAD preview · physical fit unverified",
    description:
      "A six-key wired macro pad with an OLED, custom PCB, macro layers, and a printed enclosure design.",
    tags: ["KiCad", "CAD", "CircuitPython", "USB HID"],
    overview:
      "A compact 2×3 macro pad built around a Pico-compatible controller and a small I²C OLED. The project brings together PCB design, firmware, and a custom enclosure.",
    features: [
      "Six MX-style keys with USB HID macro layers",
      "A 128×32 OLED and Pico-compatible controller",
      "KiCad PCB files, firmware source, and a case CAD design",
    ],
    progress:
      "Design files and firmware source are prepared. Physical assembly, component clearances, and fit still need to be verified. The image shows the CAD design and nominal electronics fit.",
    source: "https://github.com/hrushikbarani-hub/custom-keyboard",
    sourceLabel: "Explore the repository",
    evidence:
      "Public custom-keyboard README and photos/README.md. The CAD preview comes from that repository.",
  },
  {
    id: "maintaineros",
    title: "MaintainerOS",
    subtitle: "A clearer next step for maintainers.",
    category: "OPEN SOURCE / DEVELOPER TOOLS",
    filters: ["software"],
    status: "Published · v0.3",
    artwork: "maintainer",
    image: "assets/maintaineros.jpg",
    gallery: [
      {
        image: "assets/maintaineros-policy.jpg",
        alt: "MaintainerOS capture policy dialog for a fictional demo repository, with no token entered",
        caption: "Capture policy · fictional demo project",
      },
      {
        image: "assets/maintaineros-comparison.jpg",
        alt: "MaintainerOS saved-capture comparison for a fictional demo project",
        caption: "Capture comparison · includes fictional demo records",
      },
    ],
    alt: "MaintainerOS dashboard showing repository health history and recommended next steps",
    caption: "App screenshot · includes fictional demo projects",
    description:
      "An explainable GitHub workbench with activity snapshots, triage rules, comparisons, and a persistent action queue.",
    tags: ["Python", "FastAPI", "JavaScript", "SQLite"],
    overview:
      "MaintainerOS turns a bounded sample of public GitHub activity into a local action queue. It explains how its triage signals are measured and preserves the policy behind every saved capture.",
    features: [
      "Public GitHub imports and issue/PR evidence links",
      "Per-repository triage policies and capture comparisons",
      "Persistent action states, snapshot history, and report exports",
    ],
    progress:
      "Version 0.3 is published as a runnable local application with a CLI and Docker setup. The screenshot includes labeled fictional demo data. Source and setup instructions are available on GitHub.",
    source: "https://github.com/hrushikbarani-hub/maintaineros",
    sourceLabel: "Explore the repository",
    evidence: "Published MaintainerOS README and source at version 0.3.",
  },
  {
    id: "civiclens",
    title: "CivicLens",
    subtitle: "Follow the decision, keep the source.",
    category: "CIVIC TECH / WEB",
    filters: ["software"],
    status: "Published · v0.3",
    artwork: "civic",
    image: "assets/civiclens.jpg",
    alt: "CivicLens interface showing source-linked fictional local decision records and filters",
    caption: "App screenshot · fictional Sample City records",
    description:
      "Source-linked decision timelines, indexed search, record revisions, and saved searches for civic records.",
    tags: ["Python", "JavaScript", "SQLite FTS5", "FastAPI"],
    overview:
      "CivicLens connects observations of a local decision across meetings using references and jurisdiction. Source excerpts, summary provenance, and revisions stay alongside the records.",
    features: [
      "Decision timelines with original source excerpts",
      "Indexed literal search, filters, and saved searches",
      "Atomic record imports, revision history, and CSV exports",
    ],
    progress:
      "Version 0.3 is published as a runnable local application. Its included municipal records are fictional demonstrations. Real records can be imported as validated JSON bundles or converted from CSV.",
    source: "https://github.com/hrushikbarani-hub/civiclens",
    sourceLabel: "Explore the repository",
    evidence: "Published CivicLens README and source at version 0.3.",
  },
  {
    id: "hyprland-forge",
    title: "Hyprland Forge",
    subtitle: "A desktop that feels like mine.",
    category: "LINUX / DESKTOP ENVIRONMENTS",
    filters: ["software"],
    status: "In development",
    artwork: "forge",
    image: "assets/forge.svg?v=8",
    alt: "Conceptual illustration of a tiled Linux desktop with a shell panel",
    caption: "Desktop illustration · not a hardware screenshot",
    description:
      "A personal Arch Linux and Hyprland desktop with a custom shell, display controls, and configuration tooling.",
    tags: ["Arch Linux", "Hyprland", "Python", "QML"],
    overview:
      "A personal desktop project for Arch Linux and Hyprland. The repository contains a custom Quickshell interface, desktop configuration, and tools for installation, appearance, and display settings.",
    features: [
      "Custom Quickshell panels and desktop interface",
      "Display and appearance configuration tools",
      "Python tooling and an Arch/Hyprland configuration",
    ],
    progress:
      "Still in development, with real hardware validation pending. The repository tracks the configuration and custom shell as the desktop takes shape.",
    source: "https://github.com/hrushikbarani-hub/hyprland-forge",
    sourceLabel: "Explore the repository",
    evidence:
      "Public hyprland-forge description, project.json, and repository contents.",
  },
]
  .concat(newProjects)
  .map((project) => ({ ...project, lifecycle: projectStatus[project.id] }));

export const projectCount = projects.length;
export const publicRepoCount = projects.filter((p) => p.source).length;
