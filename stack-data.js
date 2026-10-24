export const snapshot = {
  date: "2026-10-20",
  repositories: [
    { name: "custom-keyboard", languages: ["Python"] },
    { name: "nexus-mobile", languages: ["Swift"] },
    { name: "hyprland-forge", languages: ["Python", "QML", "Lua", "Shell"] },
    {
      name: "maintaineros",
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
      languages: [
        "Python",
        "JavaScript",
        "CSS",
        "HTML",
        "PowerShell",
        "Dockerfile",
      ],
    },
  ],
  commits: {
    "2026-06-18": 1,
    "2026-10-03": 18,
    "2026-10-06": 2,
    "2026-10-07": 38,
    "2026-10-08": 2,
    "2026-10-09": 3,
    "2026-10-18": 1,
    "2026-10-20": 13,
  },
};
export function languageCounts(repositories = snapshot.repositories) {
  const counts = new Map();
  for (const repo of repositories)
    for (const language of new Set(repo.languages))
      counts.set(language, (counts.get(language) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
export function calendarDays(end = snapshot.date, weeks = 27) {
  const last = new Date(`${end}T00:00:00Z`),
    first = new Date(last);
  first.setUTCDate(
    last.getUTCDate() - (weeks - 1) * 7 - ((last.getUTCDay() + 6) % 7),
  );
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const day = new Date(first);
    day.setUTCDate(first.getUTCDate() + i);
    const date = day.toISOString().slice(0, 10);
    return { date, count: snapshot.commits[date] || 0, future: date > end };
  });
}
