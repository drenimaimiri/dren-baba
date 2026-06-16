export function playSound(src = '/sounds/click.mp3') {
  try {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
}
