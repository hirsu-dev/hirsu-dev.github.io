export const radioRelease = Object.freeze({
  title: "High Forever (Marlon Hoffstadt Remix)",
  artist: "Petite Meller · Marlon Hoffstadt",
  // Artist's official Linktree → Sony/Linkfire release → YouTube Music album.
  playlist: "OLAK5uy_nfL-pYyNkwhbiJkNpkduuX9cYqygLEJ9k",
  url: "https://cyberpunk.lnk.to/highforeverremix",
  spotify: "https://open.spotify.com/album/5pPe6MIjjVWSMY4HkO65f8",
});
export const radioVolume = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 12;
};
export function radioContent() {
  return `<header class="page-head"><div><p class="eyebrow">07 / AFTER HOURS</p><h1>A quieter frequency.</h1><p>A soundtrack for wandering through the workbench. Your volume. Your choice.</p></div></header>
  <section class="radio-station"><div class="radio-art" aria-hidden="true"><div class="radio-disc"><i></i><i></i><i></i><b>H / FM</b></div><span>INDEPENDENT SIGNAL / 001</span></div><div class="radio-track"><p class="eyebrow">ON THE DIAL / OFFICIAL RELEASE</p><h2>HIGH<br /><em>FOREVER.</em></h2><p>${radioRelease.artist}<br /><strong>Marlon Hoffstadt Remix</strong></p><p>From Cyberpunk: Edgerunners 2</p><button class="bracket" data-radio-open>[ Open listening deck ↗ ]</button><p class="fineprint">Starts at 12% volume after you press Play. A visible player stays with you across site pages. Closing it or leaving this browser tab pauses playback.</p><a href="${radioRelease.url}" target="_blank" rel="noopener noreferrer">Choose an official streaming service ↗</a></div></section>
  <div class="radio-notes"><section class="panel"><h2>Quiet by default.</h2><p>No autoplay on arrival, no music downloads, no hidden player. Open the deck, load YouTube if you want to, then press Play. The volume and mute controls stay close at hand.</p></section><section class="panel"><h2>Your connection, your call.</h2><p>Nothing from YouTube loads until you choose “Load YouTube player.” Google may receive your IP address and browser data and use cookies or show ads. Playback depends on availability, region and browser restrictions.</p><p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google privacy ↗</a> · <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube terms ↗</a></p><p>The portfolio stores no listening history or account tokens. The native player handles playback. If embedding is blocked, use the official release link.</p></section></div>`;
}

let apiPromise;
export function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const previous = window.onYouTubeIframeAPIReady;
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (window.onYouTubeIframeAPIReady === ready)
        window.onYouTubeIframeAPIReady = previous;
      if (error) {
        script.remove();
        apiPromise = null;
        reject(error);
      } else resolve(window.YT);
    };
    const ready = () => {
      try {
        previous?.();
      } finally {
        finish(window.YT?.Player ? null : new Error("Player unavailable"));
      }
    };
    const timer = setTimeout(
      () => finish(new Error("Player connection timed out")),
      12000,
    );
    window.onYouTubeIframeAPIReady = ready;
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => finish(new Error("Player blocked"));
    document.head.append(script);
  });
  return apiPromise;
}

// Persistent shell is outside the route outlet; navigation never recreates playback.
// The actual YouTube video remains visible and unobscured, never audio-only/hidden.
export function mountRadio({ loadAPI = loadYouTubeAPI } = {}) {
  const deck = document.createElement("aside");
  deck.id = "radio-deck";
  deck.hidden = true;
  deck.setAttribute("aria-labelledby", "radio-deck-title");
  deck.innerHTML = `<header><div><span class="eyebrow">HIRSU / RADIO</span><h2 id="radio-deck-title">High Forever</h2></div><button data-radio-close aria-label="Stop music and close radio">×</button></header><p class="radio-credit">Petite Meller · Marlon Hoffstadt Remix</p><div id="radio-consent"><p>Load the official YouTube release? Google receives browser data and may use cookies or show ads.</p><p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a> · <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube terms</a></p><button id="radio-load">Load YouTube player</button></div><div id="radio-frame" hidden></div><div class="radio-controls"><button id="radio-play" disabled>Play</button><button id="radio-mute" aria-pressed="false" disabled>Mute</button><label for="radio-volume">Volume <output id="radio-volume-value">12%</output></label><input id="radio-volume" type="range" min="0" max="100" value="12" /></div><p id="radio-state" role="status">Off. No external player loaded.</p><a class="radio-fallback" href="${radioRelease.url}" target="_blank" rel="noopener noreferrer">Track unavailable? Official listening links ↗</a>`;
  document.body.append(deck);
  const $ = (s) => deck.querySelector(s);
  let player = null,
    ready = false,
    playing = false,
    muted = false,
    generation = 0,
    timeout = 0,
    volume = 12,
    opener = null,
    disposed = false;
  const status = (text) => {
    $("#radio-state").textContent = text;
  };
  const controls = () => {
    $("#radio-play").disabled = !ready;
    $("#radio-mute").disabled = !ready;
    $("#radio-play").textContent = playing ? "Pause" : "Play";
    $("#radio-mute").setAttribute("aria-pressed", String(muted));
    $("#radio-mute").textContent = muted ? "Unmute" : "Mute";
    deck.dataset.playing = String(playing);
  };
  const disconnect = () => {
    generation++;
    clearTimeout(timeout);
    player?.destroy();
    player = null;
    ready = false;
    playing = false;
    muted = false;
    $("#radio-frame").replaceChildren();
    $("#radio-frame").hidden = true;
    $("#radio-consent").hidden = false;
    $("#radio-load").disabled = false;
    controls();
  };
  const open = (source) => {
    opener = source;
    deck.hidden = false;
    (ready ? $("#radio-play") : $("#radio-load")).focus();
  };
  const close = () => {
    disconnect();
    deck.hidden = true;
    status("Off. Player disconnected.");
    if (opener?.isConnected) opener.focus();
  };
  async function load() {
    disconnect();
    const token = generation;
    $("#radio-load").disabled = true;
    status("Connecting to YouTube…");
    const fail = () => {
      if (generation !== token || disposed) return;
      disconnect();
      status(
        "YouTube is blocked or this release is unavailable. Try again or use the official listening links.",
      );
    };
    try {
      const YT = await loadAPI();
      if (generation !== token || disposed) return;
      $("#radio-frame").innerHTML = '<div id="radio-youtube"></div>';
      $("#radio-frame").hidden = false;
      $("#radio-consent").hidden = true;
      timeout = setTimeout(fail, 15000);
      player = new YT.Player("radio-youtube", {
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "200",
        playerVars: {
          listType: "playlist",
          list: radioRelease.playlist,
          autoplay: 0,
          playsinline: 1,
          origin: location.origin,
        },
        events: {
          onReady(event) {
            if (generation !== token || disposed) return;
            clearTimeout(timeout);
            ready = true;
            event.target.setVolume(volume);
            status("Ready. Press Play; volume starts quiet.");
            controls();
            event.target
              .getIframe?.()
              .setAttribute(
                "title",
                "High Forever — official YouTube music player",
              );
          },
          onStateChange(event) {
            if (generation !== token || disposed) return;
            playing = event.data === 1;
            controls();
            if (playing && document.hidden) {
              player?.pauseVideo();
              return;
            }
            status(
              event.data === 1
                ? "Playing · official YouTube release"
                : event.data === 2
                  ? "Paused."
                  : event.data === 0
                    ? "Track ended. Play again when you like."
                    : event.data === 3
                      ? "Buffering…"
                      : "Ready. Press Play in the deck or YouTube player.",
            );
          },
          onError: fail,
          onAutoplayBlocked: () => {
            if (generation === token)
              status("Press Play directly inside the YouTube player to begin.");
          },
        },
      });
    } catch {
      fail();
    }
  }
  const click = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-radio-open")) open(b);
    if (!deck.contains(b)) return;
    if (b.hasAttribute("data-radio-close")) close();
    if (b.id === "radio-load") load();
    if (b.id === "radio-play" && ready) {
      if (playing) player.pauseVideo();
      else {
        player.setVolume(volume);
        player.playVideo();
        status("Starting… If playback is blocked, press Play inside YouTube.");
      }
    }
    if (b.id === "radio-mute" && ready) {
      muted = !muted;
      if (muted) player.mute();
      else player.unMute();
      controls();
    }
  };
  const input = (e) => {
    if (e.target.id !== "radio-volume") return;
    volume = radioVolume(e.target.value);
    $("#radio-volume-value").textContent = volume + "%";
    if (ready) player.setVolume(volume);
  };
  const visibility = () => {
    if (document.hidden && ready) player.pauseVideo();
  };
  document.addEventListener("click", click);
  deck.addEventListener("input", input);
  document.addEventListener("visibilitychange", visibility);
  return {
    open,
    close,
    pause() {
      if (ready) player.pauseVideo();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      disconnect();
      document.removeEventListener("click", click);
      deck.removeEventListener("input", input);
      document.removeEventListener("visibilitychange", visibility);
      deck.remove();
    },
  };
}
