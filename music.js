import { escapeHTML as esc } from "./console-model.js?v=15";

// Metadata and official embeds only. No recordings are copied or hosted here.
export const radioTracks = Object.freeze(
  [
    {
      id: "25KN5IFew2JifHoqx5Q7Z7",
      title: "High Forever · Marlon Hoffstadt Remix",
      artist: "Petite Meller / Marlon Hoffstadt",
    },
    {
      id: "7mykoq6R3BArsSpNDjFQTm",
      title: "I Really Want to Stay at Your House",
      artist: "Rosa Walton / Hallie Coggins",
    },
    {
      id: "24wT9mkalLcUIDt9rkpYJJ",
      title: "Let You Down",
      artist: "Dawid Podsiadło",
    },
    {
      id: "1AslaQYl1cMb1ItQKmtJer",
      title: "Never Fade Away",
      artist: "SAMURAI / Refused",
    },
    {
      id: "4dK0YKNUAMEV58MZxqN359",
      title: "Night City",
      artist: "R E L / Artemis Delta",
    },
    {
      id: "0UHxkkgI5GfV0XBRA1rqfe",
      title: "Chippin’ In",
      artist: "SAMURAI / Refused",
    },
    {
      id: "37i9dQZF1DWYMokBiQj5qF",
      type: "playlist",
      title: "Cyberpunk 2077 · continuous mix",
      artist: "Official playlist / curated by Spotify",
    },
  ].map((track) =>
    Object.freeze({
      ...track,
      uri: `spotify:${track.type || "track"}:${track.id}`,
      url: `https://open.spotify.com/${track.type || "track"}/${track.id}`,
    }),
  ),
);

let apiPromise;
let cachedAPI;
export function loadSpotifyAPI() {
  if (cachedAPI) return Promise.resolve(cachedAPI);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const previous = window.onSpotifyIframeApiReady;
    let settled = false;
    const finish = (error, api) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (window.onSpotifyIframeApiReady === ready)
        window.onSpotifyIframeApiReady = previous;
      if (error) {
        script.remove();
        apiPromise = null;
        reject(error);
      } else {
        cachedAPI = api;
        resolve(api);
      }
    };
    const ready = (api) => {
      try {
        previous?.(api);
      } finally {
        finish(
          api?.createController ? null : new Error("Player unavailable"),
          api,
        );
      }
    };
    const timer = setTimeout(
      () => finish(new Error("Connection timed out")),
      12000,
    );
    window.onSpotifyIframeApiReady = ready;
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.onerror = () => finish(new Error("Connection blocked"));
    document.head.append(script);
  });
  return apiPromise;
}

// Outside #screen: route changes, settings and layout switches preserve playback.
// Minimizing keeps the same consented player/controller mounted. Only Stop
// or disposal disconnects it; opening controls never starts playback by itself.
export function mountRadio({
  loadAPI = loadSpotifyAPI,
  readyTimeout = 15000,
} = {}) {
  const deck = document.createElement("aside");
  deck.id = "music-dock";
  deck.hidden = true;
  deck.setAttribute("aria-label", "Background music controls");
  deck.innerHTML = `<header class="music-toolbar"><span class="music-indicator" aria-hidden="true"></span><b>H / FM</b><span class="music-frequency">AFTER HOURS</span><button data-radio-close aria-label="Minimize controls; keep music playing" title="Minimize — music keeps playing">×</button></header>
    <div id="radio-consent"><p>A soundtrack while you explore.</p><p>Enable Spotify, then press Play. Spotify receives browser data and may use cookies. Nothing connects before you enable it.</p><button id="radio-load">Enable background music ↗</button></div>
    <div id="radio-frame" hidden></div>
    <div class="music-transport"><button id="radio-prev" aria-label="Previous music selection">←</button><button id="radio-play" disabled>Play</button><button id="radio-next" aria-label="Next music selection">→</button><button id="radio-queue-toggle" aria-expanded="false" aria-controls="radio-queue">Tracks <span id="radio-count">01 / 07</span></button></div>
    <div id="radio-queue" hidden><label for="radio-track">Choose a frequency</label><select id="radio-track">${radioTracks.map((track, i) => `<option value="${i}">${esc(track.title)}</option>`).join("")}</select><p id="radio-credit"></p><p>Choose the continuous mix for playlist playback. Individual selections can be changed with ← / →.</p><p>Full songs or previews depend on Spotify, sign-in and region. Use Spotify or your device for volume; this embed has no volume API.</p><p><a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">Spotify privacy ↗</a> · <a class="radio-fallback" target="_blank" rel="noopener noreferrer">Open selection in Spotify ↗</a></p></div>
    <div class="music-stop-row"><span>× hides controls. Music stays connected.</span><button data-radio-stop>Stop & disconnect</button></div><p id="radio-state" role="status">Music off. Enable to listen; use a low device volume.</p>`;
  document.body.append(deck);
  const mini = document.createElement("aside");
  mini.id = "music-mini";
  mini.hidden = true;
  mini.setAttribute("aria-label", "Minimized background radio");
  mini.innerHTML = `<button data-radio-open class="music-reopen" aria-label="Expand background radio controls" aria-controls="music-dock"><span class="music-indicator" aria-hidden="true"></span><span><small id="radio-mini-state">RADIO</small><b id="radio-mini-title"></b></span><span aria-hidden="true">↗</span></button><button id="radio-mini-play" disabled>Play</button><button data-radio-stop aria-label="Stop background music and disconnect">Stop</button>`;
  document.body.append(mini);
  const $ = (selector) => deck.querySelector(selector);
  let player = null,
    ready = false,
    playing = false,
    enabled = false,
    index = 0,
    generation = 0,
    timeout = 0,
    opener = null,
    disposed = false;
  const status = (text) => {
    $("#radio-state").textContent = text;
  };
  const controls = () => {
    $("#radio-play").disabled = !ready;
    $("#radio-play").textContent = playing ? "Pause" : "Play";
    deck.dataset.playing = String(playing);
    mini.dataset.playing = String(playing);
    mini.querySelector("#radio-mini-play").disabled = !ready;
    mini.querySelector("#radio-mini-play").textContent = playing
      ? "Pause"
      : "Play";
    mini.querySelector("#radio-mini-state").textContent = playing
      ? "PLAYING / H·FM"
      : ready
        ? "PAUSED / H·FM"
        : "CONNECTING / H·FM";
    mini.hidden = !deck.hidden || !enabled;
    if (!deck.hidden) document.documentElement.dataset.music = "open";
    else if (enabled) document.documentElement.dataset.music = "background";
    else delete document.documentElement.dataset.music;
  };
  const describe = () => {
    $("#radio-track").value = String(index);
    $("#radio-count").textContent =
      `${String(index + 1).padStart(2, "0")} / 07`;
    $("#radio-credit").textContent = radioTracks[index].artist;
    $(".radio-fallback").href = radioTracks[index].url;
    mini.querySelector("#radio-mini-title").textContent =
      radioTracks[index].title;
  };
  const disconnect = () => {
    generation++;
    clearTimeout(timeout);
    const old = player;
    player = null;
    ready = playing = enabled = false;
    try {
      old?.destroy();
    } catch {
      /* A blocked iframe may already be detached. */
    }
    $("#radio-frame").replaceChildren();
    $("#radio-frame").hidden = true;
    $("#radio-consent").hidden = false;
    $("#radio-load").disabled = false;
    controls();
  };
  const open = (source) => {
    if (disposed) return;
    opener = source || document.activeElement;
    if (opener?.closest("dialog, #music-mini, #music-dock"))
      opener = document.querySelector("#city-menu");
    deck.hidden = false;
    controls();
    (ready ? $("#radio-play") : $("#radio-load")).focus();
  };
  const close = () => {
    if (disposed) return;
    deck.hidden = true;
    controls();
    if (enabled)
      status(
        "Controls minimized. Playback stays connected; reopen RADIO or use the small playback strip.",
      );
    returnFocus();
  };
  function returnFocus() {
    const target = opener?.isConnected
      ? opener
      : document.querySelector(
          '.city-nav a[href="#radio"], [data-radio-open]:not(#music-mini button)',
        );
    target?.focus();
  }
  const stop = () => {
    if (disposed) return;
    disconnect();
    status("Music off. Player disconnected.");
    if (deck.hidden) returnFocus();
  };
  const choose = (next) => {
    if (!Number.isInteger(next)) return;
    index =
      ((next % radioTracks.length) + radioTracks.length) % radioTracks.length;
    describe();
    playing = false;
    if (ready) {
      try {
        player.pause();
        player.loadEntity(radioTracks[index].uri);
      } catch {
        status("Selection unavailable. Open it in Spotify or try another.");
        return;
      }
    }
    controls();
    status(
      `${radioTracks[index].title}. ${ready ? "Press Play here or inside Spotify." : "Enable Spotify to listen."}`,
    );
  };
  async function load() {
    disconnect();
    enabled = true;
    controls();
    const token = generation;
    $("#radio-load").disabled = true;
    status("Connecting to Spotify…");
    const fail = () => {
      if (generation !== token || disposed) return;
      disconnect();
      status(
        "Spotify is blocked or unavailable. Retry, choose another track, or open the selection in Spotify under Tracks.",
      );
    };
    try {
      const api = await loadAPI();
      if (generation !== token || disposed) return;
      const host = document.createElement("div");
      $("#radio-frame").append(host);
      $("#radio-frame").hidden = false;
      $("#radio-consent").hidden = true;
      timeout = setTimeout(fail, readyTimeout);
      const initialUri = radioTracks[index].uri;
      api.createController(
        host,
        { uri: initialUri, width: "100%", height: 152 },
        (controller) => {
          if (generation !== token || disposed) {
            controller.destroy();
            return;
          }
          player = controller;
          controller.addListener("ready", () => {
            if (generation !== token || disposed) return;
            clearTimeout(timeout);
            ready = true;
            if (radioTracks[index].uri !== initialUri)
              controller.loadEntity(radioTracks[index].uri);
            controls();
            status(
              "Ready. Press Play. Spotify may offer a preview or require sign-in.",
            );
            $("#radio-frame iframe")?.setAttribute(
              "title",
              "Spotify background music player",
            );
          });
          controller.addListener("playback_update", (event) => {
            if (generation !== token || disposed || !ready) return;
            playing = event.data.isPaused === false;
            controls();
            const text = playing
              ? "Playing · stays with you across site pages."
              : "Paused · press Play inside Spotify if your browser blocks playback.";
            if ($("#radio-state").textContent !== text) status(text);
          });
        },
      );
    } catch {
      fail();
    }
  }
  const click = (event) => {
    const trigger = event.target.closest('[data-radio-open], a[href="#radio"]');
    if (trigger) {
      event.preventDefault();
      trigger.closest("dialog")?.close();
      open(trigger);
      return;
    }
    const button = event.target.closest("button");
    if (!button || (!deck.contains(button) && !mini.contains(button))) return;
    if (button.hasAttribute("data-radio-close")) close();
    if (button.hasAttribute("data-radio-stop")) stop();
    if (button.id === "radio-load") load();
    if (button.id === "radio-prev") choose(index - 1);
    if (button.id === "radio-next") choose(index + 1);
    if (button.id === "radio-queue-toggle") {
      $("#radio-queue").hidden = !$("#radio-queue").hidden;
      button.setAttribute("aria-expanded", String(!$("#radio-queue").hidden));
    }
    if (["radio-play", "radio-mini-play"].includes(button.id) && ready) {
      try {
        if (playing) player.pause();
        else {
          player.play();
          status(
            "Starting… If nothing plays, press Play directly inside Spotify.",
          );
        }
      } catch {
        status(
          "Press Play directly inside Spotify, or open the selection under Tracks.",
        );
      }
    }
  };
  const change = (event) => {
    if (event.target.id === "radio-track") choose(Number(event.target.value));
  };
  const key = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };
  document.addEventListener("click", click);
  deck.addEventListener("change", change);
  deck.addEventListener("keydown", key);
  describe();
  controls();
  return {
    open,
    close,
    stop,
    dispose() {
      if (disposed) return;
      disposed = true;
      disconnect();
      delete document.documentElement.dataset.music;
      document.removeEventListener("click", click);
      deck.removeEventListener("change", change);
      deck.removeEventListener("keydown", key);
      deck.remove();
      mini.remove();
    },
  };
}
