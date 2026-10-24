import { projects } from "./projects.js?v=23";
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function aim(value = {}) {
  const az = Number(value.az),
    alt = Number(value.alt);
  return {
    az: Number.isFinite(az) ? ((az % 360) + 360) % 360 : 0,
    alt: Number.isFinite(alt) ? clamp(alt, 0, 90) : 25,
  };
}

export function aimPoint(value) {
  const { az, alt } = aim(value),
    radius = ((90 - alt) / 90) * 126,
    angle = (az * Math.PI) / 180;
  return {
    x: 160 + Math.sin(angle) * radius,
    y: 160 - Math.cos(angle) * radius,
  };
}
export function pointAim(x, y) {
  return aim({
    az: (Math.atan2(x - 160, 160 - y) * 180) / Math.PI,
    alt: 90 - (Math.min(126, Math.hypot(x - 160, y - 160)) / 126) * 90,
  });
}
export function blendAim(from, to, progress) {
  const a = aim(from),
    b = aim(to),
    t = clamp(progress, 0, 1),
    eased = t * t * (3 - 2 * t);
  const delta = ((b.az - a.az + 540) % 360) - 180;
  return aim({
    az: a.az + delta * eased,
    alt: a.alt + (b.alt - a.alt) * eased,
  });
}
export const labServices = Object.freeze([
  {
    id: "pihole",
    name: "Pi-hole",
    tag: "AD BLOCKING",
    headline: "A quieter home network.",
    intro: "My Raspberry Pi setup included Pi-hole for network ad blocking.",
    steps: [
      {
        name: "Device",
        title: "A device requests a domain.",
        body: "This browser animation stands in for a device on the home network. It sends no real DNS request.",
      },
      {
        name: "Pi-hole",
        title: "Pi-hole checks the request.",
        body: "Pi-hole can filter domains against its configured lists. This explains the role of the service, not my actual blocklist.",
      },
      {
        name: "Result",
        title: "A filtered result returns.",
        body: "A listed domain can be blocked; an allowed one can resolve normally. There are no real traffic counts or device records here.",
      },
    ],
  },
  {
    id: "tailscale",
    name: "Tailscale",
    tag: "REMOTE ACCESS",
    headline: "Home, beyond the home Wi-Fi.",
    intro:
      "Tailscale was part of my Pi home lab for remote access. NEXUS also includes views for home services.",
    steps: [
      {
        name: "Away",
        title: "Start from another device.",
        body: "Imagine reaching the home setup while away. This demo does not discover your devices or request network permissions.",
      },
      {
        name: "Tailscale",
        title: "Use the configured private connection.",
        body: "Tailscale supplies the remote-access part of this home-lab story. The diagram omits real devices, addresses and credentials.",
      },
      {
        name: "Home service",
        title: "Reach a permitted service.",
        body: "Actual access depends on the configured devices and permissions. Nothing on this portfolio opens or controls those services.",
      },
    ],
  },
  {
    id: "vpn",
    name: "VPN",
    tag: "CONNECTIVITY",
    headline: "Another part of my home stack.",
    intro: "VPN connectivity was one of the services in my Raspberry Pi setup.",
    steps: [
      {
        name: "Client",
        title: "Begin with a configured client.",
        body: "My project description includes a VPN. The provider, protocol and configuration are not documented here.",
      },
      {
        name: "VPN link",
        title: "Follow the connection concept.",
        body: "The animated path illustrates the idea of a VPN connection. It is not a connection test, traffic measurement or security guarantee.",
      },
      {
        name: "Destination",
        title: "Return to the build itself.",
        body: "Read the Pi home-lab file for what I actually built: Pi-hole, VPN and Tailscale. No private network details are published.",
      },
    ],
  },
]);
const project = (id) => projects.find((p) => p.id === id);
export const macroLayers = Object.freeze({
  hardware: [
    "robo-telescope",
    "custom-keyboard",
    "pi-homelab",
    "nexus-ai",
    "hyprland-forge",
    "maintaineros",
  ].map(project),
  software: [
    "maintaineros",
    "civiclens",
    "nexus-ai",
    "hyprland-forge",
    "offline-project-notebook",
    "observatory-planner",
  ].map(project),
  tools: [
    "coordinate-motor-simulator",
    "homelab-health",
    "network-privacy-auditor",
    "accessible-star-map",
    "repair-parts-tracker",
    "observatory-planner",
  ].map(project),
});
export const macroLabels = Object.freeze({
  "robo-telescope": "SCOPE",
  "custom-keyboard": "MACRO",
  "pi-homelab": "PI LAB",
  "nexus-ai": "NEXUS",
  "hyprland-forge": "FORGE",
  maintaineros: "MAINT",
  civiclens: "CIVIC",
  "offline-project-notebook": "NOTES",
  "observatory-planner": "PLAN",
  "coordinate-motor-simulator": "MOTION",
  "homelab-health": "HEALTH",
  "network-privacy-auditor": "PRIVACY",
  "accessible-star-map": "SKY",
  "repair-parts-tracker": "REPAIR",
});
