import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  intros,
  introById,
  introOptions,
  introArtwork,
  redlineParticles,
  introStorageKey,
  defaultIntro,
} from "./intro-variants.js";

test("six distinct startup sequences with deterministic safe fallback", () => {
  assert.equal(defaultIntro, "redline");
  assert.equal(introStorageKey, "hirsu-startup-v17");
  assert.match(introOptions(null), /^<label[^]*?value="redline" checked/);
  assert.equal(intros.length, 6);
  assert.equal(new Set(intros.map((i) => i.id)).size, 6);
  assert.equal(new Set(intros.map((i) => introArtwork(i.id))).size, 6);
  for (const value of [null, undefined, "unknown", "__proto__", "<script>"])
    assert.equal(introById(value).id, "redline");
  for (const intro of intros) {
    assert.equal(introById(intro.id), intro);
    assert.equal(intro.stages.length, 3);
  }
});
test("Redline is an independent split-screen scene with bounded red particle geometry", () => {
  const html = introArtwork("redline");
  assert.equal((html.match(/class="cut-panel /g) || []).length, 2);
  assert.match(html, /class="cut-beam"/);
  assert.equal((html.match(/class="cut-spark"/g) || []).length, 72);
  assert.doesNotMatch(html, /intro-backdrop|red-gate|red-blades/);
  for (const p of redlineParticles) {
    assert.ok(p.y >= 0 && p.y <= 100);
    assert.ok(Math.abs(p.dx) <= 285 && Math.abs(p.dy) <= 85);
    assert.ok(p.delay >= 2 && p.delay + 0.58 <= 2.9);
    assert.ok(p.width <= 38 && p.height <= 5);
  }
});
test("the new non-original scenes do not reuse the large loader title layout", () => {
  const css = readFileSync(
    new URL("intro-scenes.css", import.meta.url),
    "utf8",
  );
  for (const scene of [
    "neural-core",
    "rain-terminal",
    "ghost-scope",
    "shard-emblem",
    "cut-scene",
  ])
    assert.ok(css.includes(`.${scene}`));
  assert.match(
    css,
    /#boot-dialog:not\(\[data-intro="fracture"\]\) :is\(#boot-title, #boot-description\)/,
  );
});
test("selector is a native labeled radio group with one selected option", () => {
  for (const intro of intros) {
    const html = introOptions(intro.id);
    assert.equal((html.match(/type="radio"/g) || []).length, 6);
    assert.equal((html.match(/ checked/g) || []).length, 1);
    assert.ok(html.includes(`value="${intro.id}" checked`));
    assert.equal((html.match(/<label/g) || []).length, 6);
  }
});
test("Redline impact is a single small shake, scoped to artwork and disabled without motion", () => {
  const css = readFileSync(
    new URL("motion-upgrade.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /html\[data-motion="on"\][^{}]*#boot-dialog\[open\]\[data-intro="redline"\] \.cut-scene/,
  );
  assert.match(css, /redline-impact-shake 0\.34s 2\.23s/);
  assert.match(css, /translate\(-4px,\s*2px\)/);
  assert.match(
    css,
    /html\[data-motion="off"\][^{}]*\.cut-scene[^{}]*\{\s*animation: none !important/,
  );
  assert.ok(0.34 + 2.23 < 2.9);
});
test("artwork stays local and decorative; every variant has a bounded visual treatment", () => {
  const css = readFileSync(
    new URL("intro-variants.css", import.meta.url),
    "utf8",
  );
  const shell = readFileSync(new URL("index.html", import.meta.url), "utf8");
  assert.match(shell, /id="boot-variant-art"[^>]*aria-hidden="true"/);
  assert.match(shell, /fieldset class="intro-picker"/);
  for (const intro of intros) {
    assert.doesNotMatch(
      introArtwork(intro.id),
      /<script|<audio|<iframe|https?:/,
    );
    assert.ok(css.includes(`[data-intro="${intro.id}"]`));
  }
  assert.match(css, /data-motion="off"/);
  assert.match(css, /data-visibility="hidden"/);
});
