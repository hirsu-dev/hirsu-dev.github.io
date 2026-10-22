import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  intros,
  introById,
  introOptions,
  introArtwork,
} from "./intro-variants.js";

test("six distinct startup sequences with deterministic safe fallback", () => {
  assert.equal(intros.length, 6);
  assert.equal(new Set(intros.map((i) => i.id)).size, 6);
  assert.equal(new Set(intros.map((i) => introArtwork(i.id))).size, 6);
  for (const value of [null, undefined, "unknown", "__proto__", "<script>"])
    assert.equal(introById(value).id, "fracture");
  for (const intro of intros) {
    assert.equal(introById(intro.id), intro);
    assert.equal(intro.stages.length, 3);
  }
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
