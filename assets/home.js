const film = document.querySelector('.film-window');
const track = film.querySelector('.film-track');
const sequence = track.firstElementChild;
const toggle = document.querySelector('.play-switch');
const motion = matchMedia('(prefers-reduced-motion: reduce), (hover: none)');

let offset = 0;
let period = 0;
let lastTime = 0;
let impulse = 0;
let frameId = 0;
let paused = false;
let overStill = false;

function measure() {
  const gap = parseFloat(getComputedStyle(track).columnGap);
  period = sequence.getBoundingClientRect().width + gap;
}

function animate(time) {
  const elapsed = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
  lastTime = time;

  if ((!paused || Math.abs(impulse) > .5) && !film.matches(':focus-within')) {
    const speed = paused || overStill ? 0 : film.clientWidth * .055;
    offset = ((offset + elapsed * (speed + impulse)) % period + period) % period;
    impulse *= Math.exp(-elapsed * 8);
    track.style.transform = `translate3d(${-offset}px,0,0)`;
  }

  frameId = requestAnimationFrame(animate);
}

function configureMotion() {
  cancelAnimationFrame(frameId);
  track.querySelectorAll('[aria-hidden="true"].film-sequence').forEach(copy => copy.remove());
  track.style.removeProperty('transform');
  film.toggleAttribute('data-motion', !motion.matches);
  toggle.hidden = motion.matches;

  if (motion.matches) return;

  for (let i = 0; i < 2; i++) {
    const copy = sequence.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(link => link.tabIndex = -1);
    track.append(copy);
  }

  measure();
  lastTime = 0;
  frameId = requestAnimationFrame(animate);
}

film.addEventListener('pointerover', event => {
  overStill = Boolean(event.target.closest('a.still'));
});
film.addEventListener('pointerleave', () => overStill = false);
film.addEventListener('pointermove', event => {
  if (motion.matches || event.pointerType !== 'mouse' || Math.abs(event.movementX) < 2) return;
  impulse = Math.max(-1250, Math.min(1250, event.movementX * 37));
});
film.addEventListener('wheel', event => {
  if (motion.matches || event.ctrlKey) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? film.clientWidth : 1;
  impulse = Math.max(-2600, Math.min(2600, impulse + delta * unit * 15));
}, { passive: false });

toggle.addEventListener('click', () => {
  paused = !paused;
  impulse = 0;
  const action = paused ? 'Resume gallery' : 'Pause gallery';
  toggle.setAttribute('aria-label', action);
  toggle.title = action;
  toggle.toggleAttribute('data-paused', paused);
});

new ResizeObserver(measure).observe(sequence);
motion.addEventListener('change', configureMotion);
configureMotion();

const views = document.querySelectorAll('[data-view]');
const navLinks = document.querySelectorAll('.opening-header nav a, .info-links a');
const routes = new Set(['lighting', 'set-design', 'about']);

function showCurrentView() {
  const requestedView = location.hash.slice(1);
  const hash = requestedView === 'info' ? 'about' : requestedView;
  const screen = routes.has(hash) ? hash : 'home';
  const previous = document.body.dataset.screen;
  document.body.dataset.screen = screen;

  for (const view of views) {
    view.hidden = screen === 'home'
      ? !['home', 'about'].includes(view.dataset.view)
      : view.dataset.view !== screen;
  }

  for (const link of navLinks) {
    if (link.hash === '#' + screen) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  if (screen !== 'home' || (previous && previous !== screen && !hash)) {
    window.scrollTo(0, 0);
  } else if (previous && previous !== screen && hash) {
    document.getElementById(hash)?.scrollIntoView();
  }
}

window.addEventListener('hashchange', showCurrentView);
showCurrentView();
