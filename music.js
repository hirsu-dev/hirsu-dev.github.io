import { escapeHTML as esc } from "./console-model.js?v=19";
import { createAudioOutput } from "./audio-output.js?v=20";

// Owner supplied these recordings and confirmed public hosting/streaming permission.
export const radioTracks = Object.freeze(
  [
    {
      id: "high-forever-remix",
      title: "High Forever · Marlon Hoffstadt Remix",
      artist: "Petite Meller / Marlon Hoffstadt",
    },
    {
      id: "stay-at-your-house",
      title: "I Really Want to Stay at Your House",
      artist: "Rosa Walton / Hallie Coggins",
    },
    { id: "let-you-down", title: "Let You Down", artist: "Dawid Podsiadło" },
    {
      id: "never-fade-away-cover",
      title: "Never Fade Away · SAMURAI Cover",
      artist: "P.T. Adamczyk / Olga Jankowska",
    },
    { id: "night-city", title: "Night City", artist: "R E L / Artemis Delta" },
  ].map((track) =>
    Object.freeze({ ...track, src: `assets/audio/${track.id}.mp3` }),
  ),
);

export function formatTime(value) {
  const seconds = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// Outside the route outlet. Minimizing never unloads audio. No src before Play.
export function mountRadio({
  createAudio = () => document.createElement("audio"),
  createOutput = createAudioOutput,
} = {}) {
  const deck = document.createElement("aside");
  deck.id = "music-dock";
  deck.hidden = true;
  deck.setAttribute("aria-label", "Background music controls");
  deck.innerHTML = `<header class="music-toolbar"><span class="music-indicator" aria-hidden="true"></span><b>H / FM</b><span class="music-frequency">AFTER HOURS</span><button data-radio-close aria-label="Minimize controls; keep music playing" title="Minimize — music keeps playing">×</button></header>
    <div class="music-now"><span class="music-format">FULL TRACK / AUDIO ONLY</span><h2 id="radio-title"></h2><p id="radio-credit"></p><span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>
    <div id="radio-consent"><p>Your soundtrack. No preview timer.</p><p>Five full recordings, served by this site. No Spotify, video, account or third-party player. Music loads only when you press Play.</p><button id="radio-load">Play music ↗</button></div>
    <div class="music-timeline"><div><span id="radio-elapsed">0:00</span><span id="radio-duration">—:—</span></div><label class="music-sr" for="radio-seek">Seek within song</label><input id="radio-seek" type="range" min="0" max="1000" step="1" value="0" disabled /></div>
    <div class="music-transport"><button id="radio-prev" aria-label="Previous track">←</button><button id="radio-play" disabled>Play</button><button id="radio-next" aria-label="Next track">→</button><button id="radio-queue-toggle" aria-expanded="false" aria-controls="radio-queue">Tracks <span id="radio-count"></span></button></div>
    <div class="music-volume"><button data-radio-mute aria-pressed="false">Mute</button><label for="radio-volume">Volume</label><input id="radio-volume" type="range" min="0" max="100" value="15" /><output for="radio-volume" data-volume-label>15%</output></div>
    <div id="radio-queue" hidden><label for="radio-track">Choose a track</label><select id="radio-track">${radioTracks.map((t, i) => `<option value="${i}">${esc(t.title)}</option>`).join("")}</select><label class="radio-continue"><input id="radio-continue" type="checkbox" checked /> Continue to the next track</label><p>Full supplied files—no artificial time limit. The last track returns to the first when continuous playback is on.</p><p>Starts at 15% each visit. Volume and mute stay with you through track and page changes. Your device volume still applies.</p><details><summary>Track credits</summary><ul>${radioTracks.map((t) => `<li><b>${esc(t.title)}</b><br />${esc(t.artist)}</li>`).join("")}</ul><a href="assets/audio/README.md" target="_blank" rel="noopener noreferrer">Recording credits &amp; usage notice ↗</a></details></div>
    <div class="music-stop-row"><span>× minimizes. Music keeps playing.</span><button data-radio-stop>Stop & unload</button></div><p id="radio-state" role="status">Music off. Start quietly at 15% volume.</p>`;
  const mini = document.createElement("aside");
  mini.id = "music-mini";
  mini.hidden = true;
  mini.setAttribute("aria-label", "Minimized background radio");
  mini.innerHTML = `<div class="music-mini-top"><button data-radio-open class="music-reopen" aria-label="Expand background radio controls" aria-controls="music-dock"><span class="music-indicator" aria-hidden="true"></span><span><small id="radio-mini-state">RADIO</small><b id="radio-mini-title"></b></span><span aria-hidden="true">↗</span></button><button id="radio-mini-play">Play</button><button id="radio-mini-next" aria-label="Next track">→</button><button data-radio-stop aria-label="Stop background music and unload audio">Stop</button></div><div class="music-volume"><button data-radio-mute aria-pressed="false">Mute</button><label class="music-sr" for="radio-mini-volume">Background radio volume</label><input id="radio-mini-volume" type="range" min="0" max="100" value="15" /><output for="radio-mini-volume" data-volume-label>15%</output></div><p id="radio-mini-message" role="status"></p>`;
  const host = document.createElement("div");
  host.id = "radio-audio-host";
  host.hidden = true;
  document.body.append(deck, mini, host);
  const $ = (s) => deck.querySelector(s);
  let audio = null,
    output = null,
    removeAudioEvents = () => {};
  let enabled = false,
    requested = false,
    playing = false,
    waiting = false,
    failed = false,
    index = 0,
    volume = 15,
    muted = false,
    continuous = true,
    generation = 0,
    playRequest = 0,
    disposed = false,
    opener = null;
  function status(message) {
    $("#radio-state").textContent = message;
    mini.querySelector("#radio-mini-message").textContent = message;
  }
  function controls() {
    const label = requested ? "Pause" : failed ? "Retry" : "Play";
    $("#radio-play").textContent = label;
    $("#radio-play").disabled = !enabled;
    mini.querySelector("#radio-mini-play").textContent = label;
    deck.dataset.playing = mini.dataset.playing = String(playing && !waiting);
    mini.querySelector("#radio-mini-state").textContent = failed
      ? "RETRY / H·FM"
      : waiting
        ? "LOADING / H·FM"
        : playing
          ? "PLAYING / H·FM"
          : "PAUSED / H·FM";
    $("#radio-consent").hidden = enabled;
    mini.hidden = !deck.hidden || !enabled;
    if (!deck.hidden) document.documentElement.dataset.music = "open";
    else if (enabled) document.documentElement.dataset.music = "background";
    else delete document.documentElement.dataset.music;
  }
  function syncVolume() {
    output?.setVolume(volume / 100, muted);
    for (const panel of [deck, mini]) {
      const input = panel.querySelector(".music-volume input");
      input.value = String(volume);
      input.setAttribute(
        "aria-valuetext",
        muted ? `${volume}% (muted)` : `${volume}%`,
      );
      panel.querySelector("[data-volume-label]").textContent = muted
        ? "Muted"
        : `${volume}%`;
      const button = panel.querySelector("[data-radio-mute]");
      button.textContent = muted ? "Unmute" : "Mute";
      button.setAttribute("aria-pressed", String(muted));
    }
  }
  function describe() {
    const track = radioTracks[index];
    $("#radio-title").textContent = track.title;
    $("#radio-credit").textContent = track.artist;
    $("#radio-track").value = String(index);
    $("#radio-count").textContent =
      `${String(index + 1).padStart(2, "0")} / 05`;
    mini.querySelector("#radio-mini-title").textContent = track.title;
  }
  function timeline() {
    const duration = audio?.duration;
    const valid = Number.isFinite(duration) && duration > 0;
    const position = valid
      ? Math.min(duration, Math.max(0, audio.currentTime || 0))
      : 0;
    $("#radio-duration").textContent = valid ? formatTime(duration) : "—:—";
    $("#radio-elapsed").textContent = formatTime(position);
    const seek = $("#radio-seek");
    seek.disabled = !valid;
    seek.value = valid ? String(Math.round((position / duration) * 1000)) : "0";
    seek.setAttribute(
      "aria-valuetext",
      `${formatTime(position)} of ${valid ? formatTime(duration) : "unknown duration"}`,
    );
  }
  function releaseAudio() {
    generation++;
    playRequest++;
    removeAudioEvents();
    removeAudioEvents = () => {};
    output?.dispose();
    audio = output = null;
    requested = playing = waiting = failed = false;
  }
  function loadTrack() {
    releaseAudio();
    enabled = true;
    audio = createAudio();
    audio.preload = "none";
    audio.setAttribute("playsinline", "");
    output = createOutput(audio);
    output.setVolume(volume / 100, muted);
    const token = generation,
      current = audio;
    const events = [];
    const listen = (event, fn) => {
      const safe = () => {
        if (!disposed && generation === token && audio === current) fn();
      };
      current.addEventListener(event, safe);
      events.push([event, safe]);
    };
    removeAudioEvents = () =>
      events.forEach(([event, fn]) => current.removeEventListener(event, fn));
    listen("loadedmetadata", timeline);
    listen("durationchange", timeline);
    listen("timeupdate", timeline);
    listen("playing", () => {
      if (!requested) {
        current.pause();
        return;
      }
      playing = true;
      waiting = failed = false;
      controls();
      status(`Playing ${radioTracks[index].title}.`);
    });
    listen("pause", () => {
      if (current.ended || failed) return;
      requested = playing = waiting = false;
      playRequest++;
      controls();
      status("Paused. Press Play to continue.");
    });
    listen("waiting", () => {
      if (!requested) return;
      waiting = true;
      controls();
      status("Buffering… You can pause, retry or choose another track.");
    });
    listen("error", () =>
      playbackError(
        "This recording could not load. Press Retry or choose another track.",
      ),
    );
    listen("ended", () => {
      if (!requested || !current.ended) return;
      if (continuous) choose(index + 1, true);
      else {
        requested = playing = waiting = false;
        controls();
        timeline();
        status("Track finished. Press Play to replay or choose another track.");
      }
    });
    host.append(current);
    current.src = radioTracks[index].src;
    timeline();
    controls();
  }
  function playbackError(message) {
    playRequest++;
    requested = playing = waiting = false;
    failed = true;
    output?.pause();
    controls();
    status(message);
  }
  async function play() {
    if (disposed) return;
    if (!audio || failed) loadTrack();
    const token = ++playRequest,
      current = audio;
    if (current.ended) current.currentTime = 0;
    requested = waiting = true;
    controls();
    status(`Starting ${radioTracks[index].title}…`);
    try {
      await output.play();
      if (disposed || token !== playRequest || current !== audio) return;
      if (!current.paused) {
        playing = true;
        waiting = false;
        controls();
        status(`Playing ${radioTracks[index].title}.`);
      }
    } catch (error) {
      if (disposed || token !== playRequest || current !== audio) return;
      playbackError(
        error?.name === "NotAllowedError"
          ? "Your browser blocked playback. Press Retry to allow audio."
          : "Playback failed. Press Retry or choose another track.",
      );
    }
  }
  function pause() {
    playRequest++;
    requested = playing = waiting = false;
    output?.pause();
    controls();
    status("Paused. Press Play to continue.");
  }
  function choose(next, continuePlaying = requested) {
    if (!Number.isInteger(next) || disposed) return;
    index =
      ((next % radioTracks.length) + radioTracks.length) % radioTracks.length;
    if (audio) releaseAudio();
    describe();
    timeline();
    controls();
    status(`${radioTracks[index].title}. Press Play to listen.`);
    if (continuePlaying) void play();
  }
  function returnFocus() {
    const target = opener?.isConnected
      ? opener
      : document.querySelector('.city-nav a[href="#radio"]');
    target?.focus();
  }
  function open(source) {
    if (disposed) return;
    opener = source || document.activeElement;
    if (opener?.closest("dialog, #music-mini, #music-dock"))
      opener = document.querySelector("#city-menu");
    deck.hidden = false;
    controls();
    (enabled ? $("#radio-play") : $("#radio-load")).focus();
  }
  function close() {
    if (disposed) return;
    deck.hidden = true;
    controls();
    returnFocus();
  }
  function stop() {
    if (disposed) return;
    releaseAudio();
    enabled = false;
    controls();
    timeline();
    status("Music stopped. Audio unloaded.");
    if (deck.hidden) returnFocus();
  }
  function click(event) {
    const trigger = event.target.closest('[data-radio-open], a[href="#radio"]');
    if (trigger) {
      event.preventDefault();
      trigger.closest("dialog")?.close();
      open(trigger);
      return;
    }
    const b = event.target.closest("button");
    if (!b || (!deck.contains(b) && !mini.contains(b))) return;
    if (b.hasAttribute("data-radio-close")) close();
    if (b.hasAttribute("data-radio-stop")) stop();
    if (b.hasAttribute("data-radio-mute")) {
      muted = !muted;
      syncVolume();
    }
    if (b.id === "radio-load") {
      void play();
      $("#radio-play").focus({ preventScroll: true });
      deck.scrollTop = 0;
    }
    if (["radio-play", "radio-mini-play"].includes(b.id))
      requested ? pause() : void play();
    if (b.id === "radio-prev") choose(index - 1);
    if (["radio-next", "radio-mini-next"].includes(b.id)) choose(index + 1);
    if (b.id === "radio-queue-toggle") {
      $("#radio-queue").hidden = !$("#radio-queue").hidden;
      b.setAttribute("aria-expanded", String(!$("#radio-queue").hidden));
    }
  }
  function input(event) {
    if (["radio-volume", "radio-mini-volume"].includes(event.target.id)) {
      const n = Number(event.target.value);
      if (!Number.isFinite(n)) return;
      volume = Math.round(Math.min(100, Math.max(0, n)));
      muted = false;
      syncVolume();
    }
    if (
      event.target.id === "radio-seek" &&
      audio &&
      Number.isFinite(audio.duration) &&
      audio.duration > 0
    ) {
      const n = Number(event.target.value);
      if (Number.isFinite(n))
        audio.currentTime = Math.min(1, Math.max(0, n / 1000)) * audio.duration;
      timeline();
    }
  }
  function change(event) {
    if (event.target.id === "radio-track") choose(Number(event.target.value));
    if (event.target.id === "radio-continue") continuous = event.target.checked;
  }
  function key(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  }
  document.addEventListener("click", click);
  deck.addEventListener("input", input);
  mini.addEventListener("input", input);
  deck.addEventListener("change", change);
  deck.addEventListener("keydown", key);
  describe();
  controls();
  syncVolume();
  timeline();
  return {
    open,
    close,
    stop,
    dispose() {
      if (disposed) return;
      disposed = true;
      releaseAudio();
      delete document.documentElement.dataset.music;
      document.removeEventListener("click", click);
      deck.removeEventListener("input", input);
      mini.removeEventListener("input", input);
      deck.removeEventListener("change", change);
      deck.removeEventListener("keydown", key);
      deck.remove();
      mini.remove();
      host.remove();
    },
  };
}
