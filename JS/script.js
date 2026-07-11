const DURATION = 600;
const STAGGER  = 120;
const OFFSET   = 0.13;

const TARGETS = [
  ['nav',                  'fadeDown'  ],
  ['h1',                   'fadeUp'    ],
  ['img:not(.GalerijaSlika)', 'pop'    ],
  ['.Texts',               'fadeUp'    ],
  ['.Program',             'fadeUp'    ],
  ['.ProgramIntroduction', 'fadeUp'    ],
  ['.introduction_Text',   'fadeUp'    ],
  ['.Stat',                'pop'       ],
];

const START = {
  fadeUp:     { opacity: 0, transform: 'translateY(36px)'  },
  fadeDown:   { opacity: 0, transform: 'translateY(-24px)' },
  pop:        { opacity: 0, transform: 'scale(0.88)'       },
  slideRight: { opacity: 0, transform: 'translateX(-40px)' },
};

function applyStart(el, type) {
  const s = START[type] || START.fadeUp;
  el.style.opacity    = s.opacity;
  el.style.transform  = s.transform;
  el.style.transition = 'none';
  el.style.willChange = 'opacity, transform';
}

function applyEnd(el, delayMs) {
  setTimeout(() => {
    el.style.transition = `opacity ${DURATION}ms cubic-bezier(.22,1,.36,1), transform ${DURATION}ms cubic-bezier(.22,1,.36,1)`;
    el.style.opacity    = '1';
    el.style.transform  = 'none';
  }, delayMs);
}

function groupByParent(elements) {
  const map = new Map();
  elements.forEach(el => {
    const key = el.parentElement || 'root';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(el);
  });
  return map;
}

function init() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const index = parseInt(el.dataset.animIndex || '0', 10);
      const delay = parseInt(el.dataset.animDelay || '0', 10);
      applyEnd(el, index * STAGGER + delay);
      observer.unobserve(el);
    });
  }, { threshold: OFFSET });

  TARGETS.forEach(([selector, type]) => {
    const found = Array.from(document.querySelectorAll(selector));
    if (!found.length) return;

    const groups = groupByParent(found);
    groups.forEach(siblings => {
      siblings.forEach((el, i) => {
        applyStart(el, type);
        el.dataset.animIndex = i;
        el.dataset.animDelay = 0;
        void el.offsetWidth;
        observer.observe(el);
      });
    });
  });
}

function animateNavOnLoad() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  applyStart(nav, 'fadeDown');
  void nav.offsetWidth;
  applyEnd(nav, 80);
}

function izrolaj(id, btn) {
  const podsekcija = document.getElementById(id);
  const program    = btn.closest('.Program');
  podsekcija.classList.toggle('open');
  program.classList.toggle('open');
  btn.textContent = podsekcija.classList.contains('open') ? 'Zatvori' : 'Više informacija →';
}

const statNums = document.querySelectorAll('.ink_num');

const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10) || 0;
  const duration = 1400;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => animateCount(entry.target), 100);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statObserver.observe(el));

/* =========================
   GALERIJA CAROUSEL — continuous glide
   ========================= */
function initGalerijaCarousel() {
  const track = document.querySelector('.MainCarousel');
  if (!track || !track.firstElementChild) {
    console.warn('Galerija carousel: .MainCarousel or its images not found.');
    return;
  }

  const GAP   = 50;
  const SPEED = 40;

  let offset     = 0;
  let firstWidth = track.firstElementChild.getBoundingClientRect().width + GAP;
  let lastTime   = null;
  let paused     = false;

  if (!firstWidth || firstWidth <= GAP) {
    console.warn('Galerija carousel: image width came back as 0 — check .GalerijaSlika CSS is loaded before this runs.');
  }

  const recalcFirstWidth = () => {
    firstWidth = track.firstElementChild.getBoundingClientRect().width + GAP;
  };
  window.addEventListener('resize', recalcFirstWidth);

  track.style.willChange = 'transform';

  function frame(now) {
    if (lastTime === null) lastTime = now;
    const dt = now - lastTime;
    lastTime = now;

    if (!paused) {
      offset += (SPEED * dt) / 1000;

      while (offset >= firstWidth && firstWidth > 0) {
        offset -= firstWidth;
        track.appendChild(track.firstElementChild);
        recalcFirstWidth();
      }

      track.style.transform = `translateX(${-offset}px)`;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  const gallery = track.closest('.Galerija');
  gallery?.addEventListener('mouseenter', () => { paused = false; });
  gallery?.addEventListener('mouseleave', () => {
    paused = false;
    lastTime = null;
  });
}

/* =========================
   SINGLE INIT BLOCK — everything starts from here, once
   ========================= */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    animateNavOnLoad();
    init();
    initGalerijaCarousel();
    document.getElementById('burgerBtn')?.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
  });
} else {
  animateNavOnLoad();
  init();
  initGalerijaCarousel();
  document.getElementById('burgerBtn')?.addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}
