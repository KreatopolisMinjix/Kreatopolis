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


  const NEWS = [
    { title: "Ubrzani kurs pevanja!", text: "Construction on the east-west corridor begins next spring, promising to cut commute times in half.", img: "https://picsum.photos/seed/news1/600/450" },
    { title: "Local Startup Raises Seed Round", text: "A three-person team building climate sensors closed funding led by regional investors.", img: "https://picsum.photos/seed/news2/600/450" },
    { title: "Museum Unveils Restored Mural", text: "Conservators spent eight months reviving a century-old fresco hidden behind drywall.", img: "https://picsum.photos/seed/news3/600/450" },
    { title: "Harvest Season Breaks Regional Record", text: "Favorable rains pushed grain yields to their highest level in over a decade.", img: "https://picsum.photos/seed/news4/600/450" },
    { title: "New Library Wing Opens Downtown", text: "The extension adds reading rooms, a maker space, and a rooftop terrace for the public.", img: "https://picsum.photos/seed/news5/600/450" },
    { title: "River Cleanup Draws Record Volunteers", text: "Over two thousand residents joined the annual effort to clear debris from the waterway.", img: "https://picsum.photos/seed/news6/600/450" },
    { title: "Tech Fair Returns After Two-Year Gap", text: "Exhibitors from forty companies showcased prototypes to a sold-out crowd.", img: "https://picsum.photos/seed/news7/600/450" },
    { title: "Historic Bridge Reopens to Traffic", text: "A two-year restoration preserved the original ironwork while reinforcing the deck.", img: "https://picsum.photos/seed/news8/600/450" },
    { title: "Symphony Announces Winter Season", text: "The program features three world premieres alongside classic repertoire.", img: "https://picsum.photos/seed/news9/600/450" },
    { title: "Farmers Market Expands to Weekdays", text: "Vendors will now set up stalls every Wednesday in addition to weekend hours.", img: "https://picsum.photos/seed/news10/600/450" },
    { title: "University Lab Patents New Alloy", text: "Researchers say the material could reduce weight in aerospace components by a third.", img: "https://picsum.photos/seed/news11/600/450" },
  ];
 
  const track = document.getElementById('track');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const rangeLabel = document.getElementById('rangeLabel');
  const pageLabel = document.getElementById('pageLabel');
  const dotsWrap = document.getElementById('dots');
 
  let cols = getCols();
  let pageIndex = 0;
 
  function getCols(){
    const w = window.innerWidth;
    if (w <= 767) return 1;
    if (w <= 1050) return 3;
    return 4;
  }
 
  function totalPages(){
    return Math.ceil(NEWS.length / cols);
  }
 
  function render(){
    track.style.setProperty('--cols', cols);
    const start = pageIndex * cols;
    const items = NEWS.slice(start, start + cols);
 
    track.innerHTML = items.map((n, i) => `
      <article class="card" style="animation-delay:${i * 0.04}s">
        <div class="card-eyebrow">DISPATCH ${String(start + i + 1).padStart(2,'0')}</div>
        <img class="card-img" src="${n.img}" alt="${n.title}" loading="lazy">
        <div class="card-body">
          <h2 class="card-title">${n.title}</h2>
          <p class="card-text">${n.text}</p>        
        </div>
      </article>
    `).join('');
 
    const tp = totalPages();
    const rangeStart = start + 1;
    const rangeEnd = Math.min(start + cols, NEWS.length);
    rangeLabel.textContent = `Prikazuje se ${String(rangeStart).padStart(2,'0')}–${String(rangeEnd).padStart(2,'0')} od ${NEWS.length}`;
    pageLabel.textContent = `Stranica ${pageIndex + 1} / ${tp}`;
 
    dotsWrap.innerHTML = Array.from({length: tp}, (_, i) =>
      `<span class="dot${i === pageIndex ? ' active' : ''}"></span>`
    ).join('');
 
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
 
  function go(direction){
    const tp = totalPages();
    pageIndex = (pageIndex + direction + tp) % tp;
    render();
  }
 
  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
 
  window.addEventListener('resize', () => {
    const newCols = getCols();
    if (newCols !== cols){
      // keep roughly the same news item in view when breakpoint changes
      const firstVisibleItem = pageIndex * cols;
      cols = newCols;
      pageIndex = Math.floor(firstVisibleItem / cols);
      const tp = totalPages();
      if (pageIndex >= tp) pageIndex = tp - 1;
      render();
    }
  });
 
  render();
