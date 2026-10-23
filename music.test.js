import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { Window } from "happy-dom";
import { mountRadio, radioTracks, formatTime } from "./music.js";
import { createAudioOutput } from "./audio-output.js";

function harness(
  t,
  { deferred = false, reject = false, autoplay = false } = {},
) {
  const win = new Window({
    url: "https://portfolio.test/",
    settings: {
      disableJavaScriptFileLoading: true,
      enableCSSFileLoading: false,
    },
  });
  const originals = new Map(
    ["window", "document"].map((k) => [
      k,
      Object.getOwnPropertyDescriptor(globalThis, k),
    ]),
  );
  Object.defineProperty(globalThis, "window", {
    value: win,
    configurable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: win.document,
    configurable: true,
  });
  win.document.body.innerHTML =
    '<button data-radio-open>Open radio</button><button id="city-menu">Menu</button><main></main>';
  const instances = [],
    calls = [];
  const radio = mountRadio({
    autoplay,
    createAudio() {
      const a = win.document.createElement("audio");
      for (const [key, value] of Object.entries({
        paused: true,
        ended: false,
        duration: NaN,
        currentTime: 0,
      }))
        Object.defineProperty(a, key, {
          value,
          writable: true,
          configurable: true,
        });
      a.play = () => {
        calls.push(["play", a]);
        if (reject)
          return Promise.reject(
            Object.assign(new Error("blocked"), { name: "NotAllowedError" }),
          );
        a.paused = false;
        if (deferred)
          return new Promise((resolve) => {
            a.resolvePlay = resolve;
          });
        a.dispatchEvent(new win.Event("playing"));
        return Promise.resolve();
      };
      a.pause = () => {
        calls.push(["pause", a]);
        const changed = !a.paused;
        a.paused = true;
        if (changed) a.dispatchEvent(new win.Event("pause"));
      };
      a.load = () => {
        calls.push(["unload", a]);
      };
      instances.push(a);
      return a;
    },
    createOutput: (a) => createAudioOutput(a, { Context: null }),
  });
  t.after(async () => {
    radio.dispose();
    await win.happyDOM.close();
    for (const [k, descriptor] of originals)
      descriptor
        ? Object.defineProperty(globalThis, k, descriptor)
        : delete globalThis[k];
  });
  const $ = (s) => win.document.querySelector(s);
  return {
    win,
    doc: win.document,
    radio,
    instances,
    calls,
    $,
    get current() {
      return instances.at(-1);
    },
    input(id, value) {
      $(id).value = String(value);
      $(id).dispatchEvent(new win.Event("input", { bubbles: true }));
    },
    event(type, a = instances.at(-1)) {
      a.dispatchEvent(new win.Event(type));
    },
    async start() {
      radio.open($("[data-radio-open]"));
      $("#radio-load").click();
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

test("catalog includes exactly the five full supplied MP3 files and the correct cover credit", () => {
  assert.equal(radioTracks.length, 5);
  assert.equal(new Set(radioTracks.map((t) => t.id)).size, 5);
  assert.match(radioTracks[3].title, /SAMURAI Cover/);
  assert.match(radioTracks[3].artist, /P.T. Adamczyk.*Olga Jankowska/);
  for (const track of radioTracks) {
    assert.match(track.src, /^assets\/audio\/[a-z-]+\.mp3$/);
    const path = new URL(track.src, import.meta.url);
    assert.ok(statSync(path).size > 1_000_000);
    const bytes = readFileSync(path);
    assert.equal(bytes.subarray(0, 3).toString(), "ID3");
  }
});

test("startup attempts playback quietly without opening the full deck or moving focus", async (t) => {
  const h = harness(t, { autoplay: true });
  await Promise.resolve();
  assert.equal(h.instances.length, 1);
  assert.equal(h.current.volume, 0.15);
  assert.equal(h.current.paused, false);
  assert.equal(h.$("#music-dock").hidden, true);
  assert.equal(h.$("#music-mini").hidden, false);
  assert.equal(h.doc.activeElement, h.doc.body);
});
test("closing startup controls stays dismissed through a blocked attempt and route changes", async (t) => {
  const h = harness(t, { autoplay: true, reject: true });
  h.$("#music-mini [data-radio-close]").click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.$("#music-mini").hidden, true);
  assert.equal(h.$("#music-dock").hidden, true);
  h.$("[data-radio-open]").click();
  assert.equal(h.$("#music-dock").hidden, false);
  assert.equal(h.$("#radio-play").textContent, "Retry");
});
test("closing all controls never interrupts startup playback or reappears on auto-next", async (t) => {
  const h = harness(t, { autoplay: true });
  await Promise.resolve();
  h.$("#music-mini [data-radio-close]").click();
  assert.equal(h.current.paused, false);
  h.current.ended = true;
  h.event("ended");
  await Promise.resolve();
  assert.equal(h.$("#music-mini").hidden, true);
  assert.equal(h.$("#music-dock").hidden, true);
  assert.equal(h.current.getAttribute("src"), radioTracks[1].src);
});

test("opening, selecting, changing volume and minimizing do not load media before Play", (t) => {
  const h = harness(t);
  h.radio.open();
  h.$("#radio-next").click();
  h.input("#radio-volume", 20);
  h.radio.close();
  assert.equal(h.instances.length, 0);
  assert.equal(h.$("audio"), null);
  assert.equal(h.$("iframe"), null);
  assert.equal(h.$("script"), null);
  assert.equal(h.$("#music-mini").hidden, true);
});

test("Play starts the same-origin recording at 15% without a preview timer", async (t) => {
  const h = harness(t);
  await h.start();
  assert.equal(h.current.getAttribute("src"), radioTracks[0].src);
  assert.equal(h.current.preload, "none");
  assert.equal(h.current.volume, 0.15);
  assert.equal(h.doc.activeElement, h.$("#radio-play"));
  assert.equal(h.$("#music-dock").dataset.playing, "true");
  h.current.currentTime = 180;
  h.current.duration = 240;
  h.event("timeupdate");
  assert.equal(h.current.paused, false);
  assert.equal(h.$("#radio-elapsed").textContent, "3:00");
});

test("both volume sliders synchronize; mute restores level; 0 and 100 work", async (t) => {
  const h = harness(t);
  await h.start();
  h.input("#radio-volume", 38);
  assert.equal(h.current.volume, 0.38);
  assert.equal(h.$("#radio-mini-volume").value, "38");
  h.$("#music-dock [data-radio-mute]").click();
  assert.equal(h.current.muted, true);
  assert.equal(h.current.volume, 0);
  assert.equal(
    h.$("#music-mini [data-radio-mute]").getAttribute("aria-pressed"),
    "true",
  );
  h.$("#music-mini [data-radio-mute]").click();
  assert.equal(h.current.volume, 0.38);
  assert.equal(h.current.muted, false);
  h.input("#radio-mini-volume", 0);
  assert.equal(h.current.muted, true);
  assert.equal(h.$("#radio-volume").value, "0");
  h.input("#radio-mini-volume", 100);
  assert.equal(h.current.volume, 1);
  assert.equal(h.current.muted, false);
});

test("minimize, route replacement, visibility and reopen preserve exact audio and position", async (t) => {
  const h = harness(t);
  await h.start();
  const a = h.current;
  a.currentTime = 57;
  const count = h.calls.length;
  h.$("[data-radio-close]").click();
  h.$("main").innerHTML = "<h1>Another page</h1>";
  h.doc.dispatchEvent(new h.win.Event("visibilitychange"));
  assert.equal(h.$("#music-mini").hidden, true);
  assert.equal(h.doc.documentElement.dataset.music, "hidden");
  h.$("[data-radio-open]").click();
  assert.equal(h.current, a);
  assert.equal(h.$("#radio-audio-host audio"), a);
  assert.equal(a.currentTime, 57);
  assert.equal(h.calls.length, count);
  assert.equal(h.$("#music-mini").hidden, true);
});

test("mini controls pause, resume and skip while preserving volume and mute", async (t) => {
  const h = harness(t);
  await h.start();
  h.radio.close();
  h.$("#radio-mini-play").click();
  assert.equal(h.current.paused, true);
  h.$("#radio-mini-play").click();
  await Promise.resolve();
  assert.equal(h.current.paused, false);
  h.input("#radio-mini-volume", 12);
  h.$("#music-mini [data-radio-mute]").click();
  const previous = h.current;
  h.$("#radio-mini-next").click();
  await Promise.resolve();
  assert.equal(previous.paused, true);
  assert.equal(previous.getAttribute("src"), null);
  assert.equal(h.current.getAttribute("src"), radioTracks[1].src);
  assert.equal(h.current.muted, true);
  h.$("#music-mini [data-radio-mute]").click();
  assert.equal(h.current.volume, 0.12);
});

test("track selection while paused makes no new download and preserves quiet level", async (t) => {
  const h = harness(t);
  await h.start();
  h.$("#radio-play").click();
  h.input("#radio-volume", 7);
  h.$("#radio-prev").click();
  assert.equal(h.instances.length, 1);
  assert.equal(h.$("audio"), null);
  assert.equal(h.$("#radio-track").value, "4");
  h.$("#radio-play").click();
  await Promise.resolve();
  assert.equal(h.current.volume, 0.07);
  assert.equal(h.current.getAttribute("src"), radioTracks[4].src);
});

test("natural endings advance continuously and wrap from last to first", async (t) => {
  const h = harness(t);
  await h.start();
  for (let i = 1; i <= 5; i++) {
    h.current.ended = true;
    h.event("ended");
    await Promise.resolve();
    assert.equal(h.current.getAttribute("src"), radioTracks[i % 5].src);
  }
  assert.equal(h.doc.querySelectorAll("audio").length, 1);
});

test("continuous-off stops at the end and Play replays instead of skipping", async (t) => {
  const h = harness(t);
  await h.start();
  h.$("#radio-continue").checked = false;
  h.$("#radio-continue").dispatchEvent(
    new h.win.Event("change", { bubbles: true }),
  );
  h.current.ended = true;
  h.current.currentTime = 240;
  h.current.paused = true;
  h.event("ended");
  assert.equal(h.instances.length, 1);
  assert.equal(h.$("#radio-play").textContent, "Play");
  h.$("#radio-play").click();
  assert.equal(h.current.currentTime, 0);
});

test("seek uses actual finite duration; formatting and non-finite inputs stay safe", async (t) => {
  const h = harness(t);
  await h.start();
  assert.equal(h.$("#radio-seek").disabled, true);
  h.current.duration = 250;
  h.event("loadedmetadata");
  h.input("#radio-seek", 600);
  assert.equal(h.current.currentTime, 150);
  assert.equal(h.$("#radio-elapsed").textContent, "2:30");
  assert.equal(h.$("#radio-duration").textContent, "4:10");
  assert.equal(
    h.$("#radio-seek").getAttribute("aria-valuetext"),
    "2:30 of 4:10",
  );
  h.current.duration = Infinity;
  h.event("durationchange");
  assert.equal(h.$("#radio-seek").disabled, true);
  assert.equal(formatTime(NaN), "0:00");
  assert.equal(formatTime(-1), "0:00");
  assert.equal(formatTime(3601), "60:01");
});

test("Stop unloads pending audio; old resolution and events cannot resurrect it", async (t) => {
  const h = harness(t, { deferred: true });
  await h.start();
  const old = h.current;
  h.radio.close();
  h.$("#music-mini [data-radio-stop]").click();
  old.resolvePlay();
  h.event("playing", old);
  h.event("error", old);
  old.ended = true;
  h.event("ended", old);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(old.paused, true);
  assert.equal(old.getAttribute("src"), null);
  assert.equal(h.$("audio"), null);
  assert.equal(h.$("#music-mini").hidden, true);
  assert.match(h.$("#radio-state").textContent, /stopped/);
});

test("Pause cancels an unresolved Play; minimizing alone does not cancel it", async (t) => {
  const h = harness(t, { deferred: true });
  await h.start();
  h.radio.close();
  h.$("#radio-mini-play").click();
  h.current.resolvePlay();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(h.current.paused, true);
  assert.equal(h.$("#radio-mini-play").textContent, "Play");
  h.$("#radio-mini-play").click();
  h.current.resolvePlay();
  h.event("playing");
  await Promise.resolve();
  assert.equal(h.$("#music-mini").dataset.playing, "true");
});

test("late events from a replaced track cannot overwrite current state or skip again", async (t) => {
  const h = harness(t, { deferred: true });
  await h.start();
  const old = h.current;
  h.$("#radio-next").click();
  old.resolvePlay();
  h.event("error", old);
  old.ended = true;
  h.event("ended", old);
  await Promise.resolve();
  assert.equal(h.instances.length, 2);
  assert.equal(h.$("#radio-track").value, "1");
  assert.equal(old.paused, true);
});

test("blocked playback and media errors offer Retry without false playing state", async (t) => {
  const h = harness(t, { reject: true });
  await h.start();
  await Promise.resolve();
  await Promise.resolve();
  assert.match(h.$("#radio-state").textContent, /blocked/);
  assert.equal(h.$("#radio-play").textContent, "Retry");
  h.$("#radio-play").click();
  assert.equal(h.instances.length, 2);
  h.event("error");
  assert.match(h.$("#radio-state").textContent, /could not load/);
  assert.equal(h.$("#music-dock").dataset.playing, "false");
});

test("Escape returns focus, credits/menu work, and disposal is idempotent", async (t) => {
  const h = harness(t);
  await h.start();
  h.$("#radio-queue-toggle").click();
  assert.equal(h.$("#radio-queue").hidden, false);
  const ids = [...h.doc.querySelectorAll("[id]")].map((el) => el.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const node of h.doc.querySelectorAll(
    "[aria-controls],label[for],output[for]",
  )) {
    const id = node.getAttribute("aria-controls") || node.getAttribute("for");
    assert.ok(h.doc.getElementById(id), id);
  }
  h.$("#music-dock").dispatchEvent(
    new h.win.KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(h.doc.activeElement, h.$("[data-radio-open]"));
  assert.equal(h.current.paused, false);
  h.radio.dispose();
  h.radio.dispose();
  assert.equal(h.$("#music-dock"), null);
  assert.equal(h.$("#music-mini"), null);
  assert.equal(h.$("#radio-audio-host"), null);
});

test("Web Audio applies quiet gain before playback, ramps volume, and closes on disposal", async (t) => {
  const h = harness(t);
  const calls = [];
  const a = h.doc.createElement("audio");
  a.play = () => {
    calls.push(["play"]);
    return Promise.resolve();
  };
  a.pause = () => calls.push(["pause"]);
  a.load = () => calls.push(["load"]);
  let ctx;
  class Context {
    constructor() {
      ctx = this;
      this.state = "suspended";
      this.currentTime = 0;
      this.destination = {};
    }
    createGain() {
      return (this.gainNode = {
        gain: {
          value: 1,
          setTargetAtTime(...args) {
            calls.push(["gain", ...args]);
          },
        },
        connect() {},
        disconnect() {
          calls.push(["gainDisconnect"]);
        },
      });
    }
    createMediaElementSource(media) {
      assert.equal(media, a);
      return {
        connect() {
          assert.equal(ctx.gainNode.gain.value, 0.15);
        },
        disconnect() {
          calls.push(["sourceDisconnect"]);
        },
      };
    }
    resume() {
      calls.push(["resume"]);
      this.state = "running";
      return Promise.resolve();
    }
    close() {
      calls.push(["close"]);
      return Promise.resolve();
    }
  }
  const out = createAudioOutput(a, { Context });
  assert.equal(a.volume, 0.15);
  await out.play();
  assert.equal(a.volume, 1);
  assert.equal(ctx.gainNode.gain.value, 0.15);
  out.setVolume(0.4);
  assert.deepEqual(calls.at(-1), ["gain", 0.4, 0, 0.025]);
  out.setVolume(0.4, true);
  assert.equal(a.muted, true);
  out.dispose();
  out.dispose();
  assert.equal(calls.filter((c) => c[0] === "close").length, 1);
});
