/** Haptic feedback helpers using the Vibration API. */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Some browsers throw if the document isn't focused
    }
  }
}

export const haptics = {
  /** Very light tap (10ms) — for small UI interactions */
  light: () => vibrate(10),
  /** Medium tap (20ms) — for button presses */
  medium: () => vibrate(20),
  /** Heavy tap (40ms) — for significant actions */
  heavy: () => vibrate(40),
  /** Quick tick (5ms) — for sector crossing during spin */
  tick: () => vibrate(5),
  /** Success pattern — for result reveal */
  success: () => vibrate([10, 50, 20]),
  /** Error pattern — for errors */
  error: () => vibrate([30, 30, 30]),
};
