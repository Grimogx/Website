const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const yearLabel = document.querySelector("#current-year");
const currentPage = document.body.dataset.page;

if (yearLabel) yearLabel.textContent = new Date().getFullYear();

document.querySelector(`[data-page-link="${currentPage}"]`)?.setAttribute("aria-current", "page");

const aboutIntroSkipKey = "jovan-about-intro:skip-next";

if (currentPage !== "about") {
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href="index.html"]') : null;
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    try {
      window.sessionStorage.setItem(aboutIntroSkipKey, "true");
    } catch (error) {
      console.warn("Could not prepare to skip the About page intro animation.", error);
    }
  });
}

if (currentPage === "about") {
  try {
    const shouldSkipIntro = window.sessionStorage.getItem(aboutIntroSkipKey) === "true";
    window.sessionStorage.removeItem(aboutIntroSkipKey);

    if (!shouldSkipIntro) {
      const wordmark = document.querySelector(".wordmark-mark");

      if (wordmark) {
        const intro = document.createElement("div");
        intro.className = "about-intro";
        intro.setAttribute("aria-hidden", "true");
        intro.innerHTML = '<span class="about-intro-mark">J</span>';

        const mark = intro.querySelector(".about-intro-mark");
        const wordmarkBounds = wordmark.getBoundingClientRect();
        document.body.classList.add("has-about-intro");
        document.body.append(intro);

        const markStyle = window.getComputedStyle(mark);
        const wordmarkStyle = window.getComputedStyle(wordmark);
        const startSize = Number.parseFloat(markStyle.fontSize);
        const endSize = Number.parseFloat(wordmarkStyle.fontSize);

        mark.style.setProperty("--intro-x", `${wordmarkBounds.left + wordmarkBounds.width / 2 - window.innerWidth / 2}px`);
        mark.style.setProperty("--intro-y", `${wordmarkBounds.top + wordmarkBounds.height / 2 - window.innerHeight / 2}px`);
        mark.style.setProperty("--intro-scale", String(endSize / startSize));
        mark.addEventListener("animationend", () => {
          intro.remove();
          document.body.classList.remove("has-about-intro");
        }, { once: true });
      }
    }
  } catch (error) {
    console.warn("Could not start the About page intro animation.", error);
  }
}

function closeMenu() {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
  menuToggle.querySelector(".menu-toggle-label").textContent = "Menu";
}

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  siteNav?.classList.toggle("is-open", !isExpanded);
  menuToggle.querySelector(".menu-toggle-label").textContent = isExpanded ? "Menu" : "Close";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (
    menuToggle?.getAttribute("aria-expanded") === "true" &&
    !siteNav?.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) closeMenu();
});

if (!document.body.classList.contains("scarlet-page")) {
const musicTracks = [
  "overworld theme.ogg",
  "first_light_particles.wav",
  "calm_theme.ogg",
  "battle_music_01.ogg",
  "SunsetWalk.ogg"
].map((file) => ({
  file,
  title: file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/^\w/, (letter) => letter.toUpperCase())
}));
const musicStorageKey = "jovan-music-player:last-track";
const musicStateKey = "jovan-music-player:playback";
const musicPlayer = document.createElement("div");
musicPlayer.className = "music-player";
musicPlayer.setAttribute("role", "region");
musicPlayer.setAttribute("aria-label", "Music player");
musicPlayer.innerHTML = `
  <div class="music-player-track">
    <span class="music-player-indicator" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="music-player-title"></span>
  </div>
  <button class="music-player-previous" type="button" aria-label="Previous track">‹</button>
  <button class="music-player-toggle" type="button" aria-label="Play music" aria-pressed="false">
    <span class="music-player-toggle-icon" aria-hidden="true"></span>
  </button>
  <button class="music-player-next" type="button" aria-label="Next track">›</button>
  <div class="music-player-timeline">
    <span class="music-player-time music-player-elapsed">0:00</span>
    <div class="music-player-seek">
      <progress class="music-player-progress" max="1" value="0" aria-hidden="true"></progress>
      <input class="music-player-range" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek through current track">
    </div>
    <span class="music-player-time music-player-duration">--:--</span>
  </div>
  <button class="music-player-loop" type="button" aria-label="Loop current track" aria-pressed="false">↻</button>
  <div class="music-player-volume-control">
    <svg class="music-player-volume-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 6v4h3l4 3V3L5 6H2Zm9-.5a3.5 3.5 0 0 1 0 5" />
    </svg>
    <input class="music-player-volume" type="range" min="0" max="1" value="0.7" step="0.01" aria-label="Volume">
  </div>
`;
document.body.append(musicPlayer);
document.body.classList.add("has-music-player");

const musicTitle = musicPlayer.querySelector(".music-player-title");
const musicProgress = musicPlayer.querySelector(".music-player-progress");
const musicRange = musicPlayer.querySelector(".music-player-range");
const musicElapsed = musicPlayer.querySelector(".music-player-elapsed");
const musicDuration = musicPlayer.querySelector(".music-player-duration");
const musicToggle = musicPlayer.querySelector(".music-player-toggle");
const musicPrevious = musicPlayer.querySelector(".music-player-previous");
const musicNext = musicPlayer.querySelector(".music-player-next");
const musicVolume = musicPlayer.querySelector(".music-player-volume");
const musicLoop = musicPlayer.querySelector(".music-player-loop");
const audio = new Audio();
audio.preload = "none";
audio.volume = Number(musicVolume.value);
let currentTrack = null;

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function updateMusicProgress() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const progress = duration > 0 ? audio.currentTime / duration : 0;
  const elapsed = formatTime(audio.currentTime);
  const total = duration > 0 ? formatTime(duration) : "--:--";

  musicProgress.value = progress;
  musicRange.value = String(Math.round(progress * Number(musicRange.max)));
  musicRange.setAttribute("aria-valuetext", `${elapsed} of ${total}`);
  musicElapsed.textContent = elapsed;
  musicDuration.textContent = total;
}

function updateMusicControl() {
  const isPlaying = !audio.paused && !audio.ended;
  musicPlayer.dataset.playing = String(isPlaying);
  musicToggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function selectRandomTrack(previousFile) {
  const candidates = musicTracks.filter((track) => track.file !== previousFile);
  const pool = candidates.length ? candidates : musicTracks;
  return pool[Math.floor(Math.random() * pool.length)];
}

function saveMusicState() {
  if (!currentTrack) return;

  try {
    window.sessionStorage.setItem(musicStateKey, JSON.stringify({
      file: currentTrack.file,
      currentTime: audio.currentTime,
      isPlaying: !audio.paused && !audio.ended,
      volume: audio.volume,
      loop: audio.loop
    }));
  } catch (error) {
    console.warn("Could not remember music playback state.", error);
  }
}

function readMusicState() {
  try {
    const savedState = JSON.parse(window.sessionStorage.getItem(musicStateKey));
    const track = musicTracks.find((candidate) => candidate.file === savedState?.file);

    if (!track) return null;
    return {
      track,
      currentTime: Number.isFinite(savedState.currentTime) && savedState.currentTime >= 0 ? savedState.currentTime : 0,
      isPlaying: savedState.isPlaying === true,
      volume: Number.isFinite(savedState.volume) ? Math.min(1, Math.max(0, savedState.volume)) : Number(musicVolume.value),
      loop: savedState.loop === true
    };
  } catch (error) {
    console.warn("Could not restore music playback state.", error);
    return null;
  }
}

function loadTrack(track) {
  currentTrack = track;
  musicTitle.textContent = track.title;
  try {
    window.localStorage.setItem(musicStorageKey, track.file);
  } catch (error) {
    console.warn("Could not remember the last music track.", error);
  }

  audio.src = `./audio/${encodeURIComponent(track.file)}`;
  updateMusicProgress();
}

function changeTrack(track, resumePlayback) {
  audio.pause();
  loadTrack(track);
  saveMusicState();
  if (resumePlayback) playMusic();
  else updateMusicControl();
}

async function playMusic() {
  try {
    await audio.play();
  } catch (error) {
    updateMusicControl();
    console.error("Could not play the selected local music track.", error);
  }
}

audio.addEventListener("play", updateMusicControl);
audio.addEventListener("pause", updateMusicControl);
audio.addEventListener("play", saveMusicState);
audio.addEventListener("pause", saveMusicState);
audio.addEventListener("timeupdate", updateMusicProgress);
audio.addEventListener("loadedmetadata", updateMusicProgress);
audio.addEventListener("durationchange", updateMusicProgress);
audio.addEventListener("ended", () => {
  const nextTrack = selectRandomTrack(currentTrack.file);
  changeTrack(nextTrack, true);
});
audio.addEventListener("error", () => {
  console.error(`Could not load local music track: ${currentTrack.file}`, audio.error);
});

musicPrevious.addEventListener("click", () => {
  const currentIndex = musicTracks.findIndex((track) => track.file === currentTrack.file);
  const previousIndex = (currentIndex - 1 + musicTracks.length) % musicTracks.length;
  changeTrack(musicTracks[previousIndex], !audio.paused);
});

musicNext.addEventListener("click", () => {
  const currentIndex = musicTracks.findIndex((track) => track.file === currentTrack.file);
  const nextIndex = (currentIndex + 1) % musicTracks.length;
  changeTrack(musicTracks[nextIndex], !audio.paused);
});

musicToggle.addEventListener("click", () => {
  if (audio.paused) playMusic();
  else audio.pause();
});

musicVolume.addEventListener("input", () => {
  audio.volume = Number(musicVolume.value);
  saveMusicState();
});

musicLoop.addEventListener("click", () => {
  audio.loop = !audio.loop;
  musicLoop.setAttribute("aria-pressed", String(audio.loop));
  saveMusicState();
});

musicRange.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  audio.currentTime = (Number(musicRange.value) / Number(musicRange.max)) * audio.duration;
  updateMusicProgress();
  saveMusicState();
});

window.addEventListener("pagehide", saveMusicState);

let lastTrack = null;
try {
  lastTrack = window.localStorage.getItem(musicStorageKey);
} catch (error) {
  console.warn("Could not read the last music track.", error);
}
const savedMusicState = readMusicState();
currentTrack = savedMusicState?.track || selectRandomTrack(lastTrack);
loadTrack(currentTrack);
if (savedMusicState) {
  audio.volume = savedMusicState.volume;
  musicVolume.value = String(savedMusicState.volume);
  audio.loop = savedMusicState.loop;
  musicLoop.setAttribute("aria-pressed", String(savedMusicState.loop));

  const restoreMusicPosition = (resumePlayback) => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(savedMusicState.currentTime, audio.duration);
    }
    updateMusicProgress();
    if (resumePlayback) playMusic();
  };

  if (savedMusicState.currentTime > 0) {
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => restoreMusicPosition(savedMusicState.isPlaying), { once: true });
    audio.load();
  } else if (savedMusicState.isPlaying) {
    playMusic();
  }
}
}
