export const repositorySnapshot = Object.freeze({
  date: "2026-10-27",
  repositories: [
    {
      name: "custom-keyboard",
      updated: "2026-10-24",
      sha: "bc340b47042bcc33dde97ae24498e9daca07169e",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/custom-keyboard/commit/bc340b47042bcc33dde97ae24498e9daca07169e",
      languages: ["Python"],
    },
    {
      name: "nexus-mobile",
      updated: "2026-10-23",
      sha: "735cebded0cf8f7ec65470b4070fef98e107e03a",
      commit: "Simplify project README",
      url: "https://github.com/hirsu-dev/nexus-mobile/commit/735cebded0cf8f7ec65470b4070fef98e107e03a",
      languages: ["Swift"],
    },
    {
      name: "hyprland-forge",
      updated: "2026-10-25",
      sha: "5344a891c5de5486c24d8d0a992d901b1eac3731",
      commit:
        "Keep the active workspace visible when scaled bars show fewer slots",
      url: "https://github.com/hirsu-dev/hyprland-forge/commit/5344a891c5de5486c24d8d0a992d901b1eac3731",
      languages: ["Python", "QML", "Shell", "Lua"],
    },
    {
      name: "maintaineros",
      updated: "2026-10-24",
      sha: "4cfdee7e39734364c5f68c854a02453ee21ffa68",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/maintaineros/commit/4cfdee7e39734364c5f68c854a02453ee21ffa68",
      languages: [
        "Python",
        "JavaScript",
        "CSS",
        "HTML",
        "PowerShell",
        "Dockerfile",
      ],
    },
    {
      name: "civiclens",
      updated: "2026-10-24",
      sha: "712efc93b07c6064e6e2d15d5b94c8e6b0380842",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/civiclens/commit/712efc93b07c6064e6e2d15d5b94c8e6b0380842",
      languages: [
        "Python",
        "CSS",
        "JavaScript",
        "HTML",
        "PowerShell",
        "Dockerfile",
      ],
    },
    {
      name: "observatory-planner",
      updated: "2026-10-24",
      sha: "ee82df1602c41f0615141c5b42f5b27323cc04e6",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/observatory-planner/commit/ee82df1602c41f0615141c5b42f5b27323cc04e6",
      languages: ["JavaScript", "Python", "CSS", "HTML"],
    },
    {
      name: "coordinate-motor-simulator",
      updated: "2026-10-24",
      sha: "534d88f707db2f8f5a2c924029a9dcae3c6804bb",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/coordinate-motor-simulator/commit/534d88f707db2f8f5a2c924029a9dcae3c6804bb",
      languages: ["JavaScript", "HTML", "CSS"],
    },
    {
      name: "homelab-health",
      updated: "2026-10-24",
      sha: "335e79a9b796fb8c8bd4f6dc4e5d7cff22eb5559",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/homelab-health/commit/335e79a9b796fb8c8bd4f6dc4e5d7cff22eb5559",
      languages: ["Python", "JavaScript", "CSS", "HTML"],
    },
    {
      name: "network-privacy-auditor",
      updated: "2026-10-24",
      sha: "5e6c4026de50ba8438bbb480658fef3dd7b42dd0",
      commit: "Tidy comment removal whitespace",
      url: "https://github.com/hirsu-dev/network-privacy-auditor/commit/5e6c4026de50ba8438bbb480658fef3dd7b42dd0",
      languages: ["JavaScript", "Python", "CSS", "HTML"],
    },
    {
      name: "accessible-star-map",
      updated: "2026-10-23",
      sha: "66d07b572195dd2e085eb82a44c276a31108f949",
      commit:
        "Build Open Sky with accessible catalog exploration and licensed bright-star data",
      url: "https://github.com/hirsu-dev/accessible-star-map/commit/66d07b572195dd2e085eb82a44c276a31108f949",
      languages: ["JavaScript", "CSS", "HTML", "Python"],
    },
    {
      name: "repair-parts-tracker",
      updated: "2026-10-23",
      sha: "4f5c6acdb680f778a9bb90f82e91ac08bca9389b",
      commit:
        "Build Benchbook with repair history and transactional parts ledger",
      url: "https://github.com/hirsu-dev/repair-parts-tracker/commit/4f5c6acdb680f778a9bb90f82e91ac08bca9389b",
      languages: ["JavaScript", "CSS", "HTML"],
    },
    {
      name: "offline-project-notebook",
      updated: "2026-10-23",
      sha: "0c267d9e33bb69cb9e74acb5bcea360ff2514a80",
      commit:
        "Build Fieldnotes with local notes, photos, diagrams and offline cache",
      url: "https://github.com/hirsu-dev/offline-project-notebook/commit/0c267d9e33bb69cb9e74acb5bcea360ff2514a80",
      languages: ["JavaScript", "CSS", "HTML"],
    },
    {
      name: "biobuzz-simulator",
      updated: "2026-10-27",
      sha: "99c93d0c425055b1c9819494e8d1e1fc559df98c",
      commit: "Recreate full-screen simulator menus and robot setup",
      url: "https://github.com/hirsu-dev/biobuzz-simulator/commit/99c93d0c425055b1c9819494e8d1e1fc559df98c",
      languages: ["CSS", "JavaScript", "HTML"],
    },
  ],
});

export function repositoryFor(source) {
  if (!source) return null;
  return (
    repositorySnapshot.repositories.find(
      (repo) => source === `https://github.com/hirsu-dev/${repo.name}`,
    ) || null
  );
}
