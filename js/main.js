'use strict';
const $ = (selector) => document.querySelector(selector);
const envelope = $('#envelope');
const invitation = $('#invitation');
const schedule = $('#scheduleDialog');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let opening = false;
let returnFocus = envelope;

// Render editable text safely; no content is interpreted as markup.
document.querySelectorAll('[data-content]').forEach((element) => {
  element.textContent = CONFIG[element.dataset.content] || '';
});
// The three semantic cards have a readable HTML fallback; config owns their content.
CONFIG.categories.forEach((category) => {
  const card = document.querySelector(`[data-format="${category.id}"]`);
  if (!card) return;
  card.querySelector('h4').textContent = category.name;
  card.querySelector('.format-english').textContent = category.english;
  card.querySelector('p').textContent = category.subtitle;
  card.querySelector('use').setAttribute('href', `#${category.icon}`);
});

CONFIG.schedule.forEach((item) => {
  const row = document.createElement('li');
  const time = document.createElement('time');
  const text = document.createElement('div');
  const title = document.createElement('strong');
  const detail = document.createElement('small');
  time.textContent = item.time;
  title.textContent = item.title;
  detail.textContent = item.detail;
  text.append(title, detail);
  row.append(time, text);
  $('#timeline').append(row);
});

function openInvitation(event) {
  if (opening || invitation.open) return;
  opening = true;
  if (musicWanted) startMusic();          // хэрэглэгчийн даралт дотор эхлүүлнэ (утсанд шаардлагатай)
  returnFocus = event.currentTarget;
  envelope.classList.add('opening');
  document.body.classList.add('dialog-open');
  envelope.setAttribute('aria-expanded', 'true');
  if (!reducedMotion.matches && navigator.vibrate) navigator.vibrate(12);
  setTimeout(() => {
    invitation.showModal();
    invitation.scrollTo({ top: 0, behavior: 'instant' });
    $('#closeInvite').focus({ preventScroll: true });
    opening = false;
  }, reducedMotion.matches ? 0 : 520);
}
function closeDialog(dialog) {
  if (!dialog.open || dialog.classList.contains('closing')) return;
  dialog.classList.add('closing');
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove('closing');
  }, reducedMotion.matches ? 0 : 240);
}
envelope.setAttribute('aria-controls', 'invitation');
envelope.setAttribute('aria-expanded', 'false');

// A single click handles touch, mouse and keyboard without duplicate touch firing.
envelope.addEventListener('click', openInvitation);
$('#openLink').addEventListener('click', openInvitation);
// Passive touch feedback never blocks native scrolling or pinch zoom.
envelope.addEventListener('touchstart', () => envelope.classList.add('touching'), { passive: true });
['touchend', 'touchcancel'].forEach((type) => envelope.addEventListener(type, () => envelope.classList.remove('touching'), { passive: true }));
$('#closeInvite').addEventListener('click', () => closeDialog(invitation));
$('#scheduleButton').addEventListener('click', () => schedule.showModal());
$('#closeSchedule').addEventListener('click', () => closeDialog(schedule));
[invitation, schedule].forEach((dialog) => {
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
  });
});
invitation.addEventListener('close', () => {
  stopMusic();
  document.body.classList.remove('dialog-open');
  envelope.classList.remove('opening');
  envelope.setAttribute('aria-expanded', 'false');
  returnFocus.focus({ preventScroll: true });
});
schedule.addEventListener('close', () => $('#scheduleButton').focus({ preventScroll: true }));

// Гүйлгэх үед хэсгүүдийг зөөлөн гаргана (IntersectionObserver байхгүй үед шууд харагдана)
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealItems = invitation.querySelectorAll('.portrait-arch, .dedication, .welcome, .date-block, .location, .format-card, .hospitality, .prize-section, .fee-section, .contact-section, .actions, .signoff, .memories figure, .invite-footer');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('rv-in'); io.unobserve(entry.target); }
    });
  }, { root: invitation, threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  let cardIndex = 0;
  revealItems.forEach((el) => {
    el.classList.add('rv');
    if (el.classList.contains('format-card')) el.style.setProperty('--d', `${(cardIndex++ % 3) * 90}ms`);
  });
  invitation.addEventListener('close', () => revealItems.forEach((el) => { el.classList.remove('rv-in'); io.observe(el); }));
  revealItems.forEach((el) => io.observe(el));
}

// Дансны дугаар хуулах (урилга modal дотор тул товч дээрээ мэдэгдэнэ)
const copyButton = $('#copyAccount');
if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const number = $('#payAccount').textContent.replace(/\s+/g, '');
    let ok = false;
    try { await navigator.clipboard.writeText(number); ok = true; } catch (_) {
      const temp = document.createElement('textarea');
      temp.value = number; temp.setAttribute('readonly', ''); temp.style.position = 'fixed'; temp.style.opacity = '0';
      invitation.append(temp); temp.select();
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
      temp.remove();
    }
    copyButton.textContent = ok ? 'Хуулагдлаа ✓' : 'Гараар хуулна уу';
    copyButton.classList.toggle('copied', ok);
    setTimeout(() => { copyButton.textContent = 'Хуулах'; copyButton.classList.remove('copied'); }, 2000);
  });
}

// ── Л. Чогдовын «Эртний бүжиг»: урилга нээхэд зөөлөн эхэлж, хаахад намжина ──
const music = $('#bgMusic');
const musicButton = $('#musicToggle');
let musicWanted = true;
let audioCtx = null;
let musicGain = null;
let pauseTimer = null;
const MUSIC_VOLUME = 0.7;

function setMusicUI(playing) {
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.setAttribute('aria-label', playing ? 'Хөгжим зогсоох' : 'Хөгжим тоглуулах');
}
// iPhone дээр audio.volume ажилладаггүй тул Web Audio-гоор чангыг нь удирдана.
// file:// хэлбэрээр нээхэд Chrome дуугүй болгодог тул тэр үед энгийн аргаар тоглуулна.
function ensureAudioGraph() {
  if (audioCtx || location.protocol === 'file:') return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  try {
    audioCtx = new Ctx();
    const source = audioCtx.createMediaElementSource(music);
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0;
    source.connect(musicGain).connect(audioCtx.destination);
  } catch (_) { audioCtx = null; musicGain = null; }
}
function fadeMusic(target, ms) {
  if (musicGain) {
    const now = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(target, now + ms / 1000);
    return;
  }
  const start = music.volume, t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / ms);
    music.volume = start + (target - start) * k;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function startMusic() {
  clearTimeout(pauseTimer);
  ensureAudioGraph();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  if (!musicGain) music.volume = 0;
  const playing = music.play();
  setMusicUI(true);
  fadeMusic(MUSIC_VOLUME, reducedMotion.matches ? 300 : 2500);
  if (playing && playing.catch) playing.catch(() => setMusicUI(false));
}
function stopMusic(ms = 900) {
  setMusicUI(false);
  fadeMusic(0, ms);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => music.pause(), ms + 60);
}
musicButton.addEventListener('click', () => {
  musicWanted = music.paused || musicButton.getAttribute('aria-pressed') !== 'true';
  if (musicWanted) startMusic(); else stopMusic(500);
});
// Өөр таб руу шилжих, утсаа түгжихэд зогсоож, буцаж ирэхэд үргэлжлүүлнэ
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (!music.paused) { music.pause(); } }
  else if (invitation.open && musicWanted) startMusic();
});
