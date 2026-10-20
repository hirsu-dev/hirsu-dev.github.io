import test from "node:test";
import assert from "node:assert/strict";
import { calendarDays, languageCounts, snapshot } from "./stack-data.js";
import { wrap } from "./motion.js";

test("wheel wraps in both directions, including multi-turn drags", () => {
  assert.equal(wrap(-1, 11), 10);
  assert.equal(wrap(11, 11), 0);
  assert.equal(wrap(-25, 11), 8);
});
test("language counts are per repository, not duplicated file/language entries", () => {
  assert.deepEqual(
    languageCounts([
      { languages: ["Python", "Python"] },
      { languages: ["Python", "Swift"] },
    ]),
    [
      ["Python", 2],
      ["Swift", 1],
    ],
  );
  assert.equal(languageCounts().find(([name]) => name === "Python")[1], 4);
});
test("calendar uses UTC, starts Monday, preserves the bounded snapshot counts", () => {
  const days = calendarDays();
  assert.equal(days.length, 189);
  assert.equal(new Date(`${days[0].date}T00:00:00Z`).getUTCDay(), 1);
  assert.equal(
    days.reduce((sum, day) => sum + day.count, 0),
    Object.values(snapshot.commits).reduce((a, b) => a + b, 0),
  );
  assert.equal(days.find((d) => d.date === "2026-10-07").count, 38);
  assert.equal(days.find((d) => d.date === "2026-10-21").future, true);
  assert.equal(
    calendarDays("2024-03-01", 1).find((d) => d.date === "2024-02-29").future,
    false,
  );
});
