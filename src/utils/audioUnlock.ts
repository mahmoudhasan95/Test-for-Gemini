let audioUnlocked = false;

export function unlockAudio() {
  if (audioUnlocked) return;

  const audio = new Audio();
  audio.volume = 1.0;
  audio.muted = false;

  const unlockAudioContext = () => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audioUnlocked = true;
          console.log('Audio unlocked successfully');
          removeListeners();
        })
        .catch((error) => {
          console.warn('Audio unlock failed:', error);
        });
    }
  };

  const removeListeners = () => {
    document.removeEventListener('touchstart', unlockAudioContext);
    document.removeEventListener('touchend', unlockAudioContext);
    document.removeEventListener('click', unlockAudioContext);
    document.removeEventListener('keydown', unlockAudioContext);
  };

  document.addEventListener('touchstart', unlockAudioContext, { once: true, passive: true });
  document.addEventListener('touchend', unlockAudioContext, { once: true, passive: true });
  document.addEventListener('click', unlockAudioContext, { once: true });
  document.addEventListener('keydown', unlockAudioContext, { once: true });
}

export function isAudioUnlocked() {
  return audioUnlocked;
}
