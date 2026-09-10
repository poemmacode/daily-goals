/** Alarma sintetizada con Web Audio API: 3 beeps, sin archivos externos. */
export function playAlarm(): void {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;

  [0, 0.6, 1.2].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.5, now + offset + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.55);
  });

  // Limpieza del contexto tras la alarma.
  setTimeout(() => void ctx.close(), 2500);

  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
}
