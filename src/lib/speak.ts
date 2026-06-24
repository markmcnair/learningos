// Read-aloud for the kid path, using the browser's built-in speech synthesis.
// No dependency, no network, no key. A pre-reader can do a whole session solo.

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string): void {
  if (!speechAvailable() || !text.trim()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel(); // never let two voices overlap
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; // a touch slower for little ears
    u.pitch = 1.1; // a touch brighter
    synth.speak(u);
  } catch {
    // best-effort; silence is an acceptable fallback
  }
}

export function stopSpeaking(): void {
  if (!speechAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
