// Same-origin audio. Gain control also works where media-element volume does not.
export function createAudioOutput(
  audio,
  { Context = window.AudioContext || window.webkitAudioContext } = {},
) {
  let context,
    source,
    gain,
    disposed = false,
    volume = 0.15,
    muted = false;
  const level = () => (muted ? 0 : volume);
  function setVolume(value, silent = false) {
    volume = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.15));
    muted = silent;
    audio.muted = muted || volume === 0;
    if (gain) gain.gain.setTargetAtTime(level(), context.currentTime, 0.025);
    else audio.volume = level();
  }
  setVolume(volume);
  return {
    setVolume,
    async play() {
      if (disposed) return;
      if (!context && Context) {
        context = new Context();
        gain = context.createGain();
        gain.gain.value = level();
        source = context.createMediaElementSource(audio);
        source.connect(gain);
        gain.connect(context.destination);
        audio.volume = 1; // gain now applies attenuation
      }
      // Both calls occur within the gesture, not after an await.
      const resumed =
        context?.state !== "running" ? context?.resume() : undefined;
      await Promise.all([resumed, audio.play()]);
    },
    pause() {
      audio.pause();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      source?.disconnect();
      gain?.disconnect();
      context?.close()?.catch(() => {});
      audio.remove();
    },
  };
}
