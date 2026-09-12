

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Theme toggle (light / dark) ---------- */
  const themeButtons = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')].filter(Boolean);
  function updateThemeIcons(){
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeButtons.forEach(btn => { btn.textContent = isDark ? '☀' : '☾'; });
  }
  updateThemeIcons();
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if(isDark){
        document.documentElement.removeAttribute('data-theme');
        try{ localStorage.setItem('rs-theme', 'light'); }catch(e){}
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        try{ localStorage.setItem('rs-theme', 'dark'); }catch(e){}
      }
      updateThemeIcons();
    });
  });

  /* ---------- Publication filters ---------- */
  const pubFilters = document.querySelectorAll('.pub-filter');
  const pubs = document.querySelectorAll('.pub');
  pubFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      pubFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      pubs.forEach(pub => {
        const show = filter === 'all' || pub.dataset.venue === filter;
        pub.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------- Copy-to-clipboard buttons ---------- */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try{
        await navigator.clipboard.writeText(text);
      } catch(e){
        /* clipboard API unavailable — silently ignore, mailto link still works */
      }
      const original = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1600);
    });
  });

  /* ---------- Mobile nav toggle ---------- */
  const burger = document.getElementById('burgerBtn');
  const mobilePanel = document.getElementById('mobilePanel');

  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open);
  });

  mobilePanel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('progressBar');
  function updateProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- Back to top button ---------- */
  const toTop = document.getElementById('toTop');
  function updateToTop(){
    if(window.scrollY > 480){ toTop.classList.add('show'); }
    else{ toTop.classList.remove('show'); }
  }
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateActiveNav(){
    let currentId = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      if(sec.offsetTop <= scrollPos){ currentId = sec.id; }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  /* ---------- Sticky header shadow once page has scrolled ---------- */
  const siteHeader = document.getElementById('siteHeader');
  function updateHeaderShadow(){
    if(!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  }

  /* ---------- Combined scroll handler (throttled via rAF) ---------- */
  let ticking = false;
  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(() => {
        updateProgress();
        updateToTop();
        updateActiveNav();
        updateHeaderShadow();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-triggered reveal, staggered by position within its group ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Give siblings that reveal together a small, increasing delay so they
  // step in one after another instead of popping in all at once.
  const groupCounters = new WeakMap();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    const n = groupCounters.get(parent) || 0;
    if(!reduceMotion){
      el.style.setProperty('--reveal-delay', Math.min(n, 4) * 90 + 'ms');
    }
    groupCounters.set(parent, n + 1);
  });

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Hero scroll cue ---------- */
  const scrollCue = document.getElementById('scrollCue');
  if(scrollCue){
    scrollCue.addEventListener('click', () => {
      const about = document.getElementById('about');
      if(about){ about.scrollIntoView({ behavior: 'smooth' }); }
    });
  }

  /* ---------- Hero spotlight follows the cursor ---------- */
  const hero = document.querySelector('.hero');
  const spotlight = document.getElementById('heroSpotlight');
  if(hero && spotlight && window.matchMedia('(hover:hover)').matches){
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mx', x + '%');
      hero.style.setProperty('--my', y + '%');
    });
  }

  /* ---------- Button hover glow follows the cursor ---------- */
  if(window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', ((e.clientX - r.left) / r.width) * 100 + '%');
        btn.style.setProperty('--by', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });
  }

  /* ---------- Subtle 3D tilt on cards + hero photo ---------- */
  if(!reduceMotion && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.tilt-card').forEach(card => {
      const strength = 8; // max degrees of rotation
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * strength * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (py * -strength * 2).toFixed(2) + 'deg');
        card.style.setProperty('--ty', '-4px');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ---------- Animated stat counters (hero) ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCounter(el){
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if(reduceMotion || isNaN(target)){
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if(p < 1){ requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }
  if(counters.length){
    if('IntersectionObserver' in window){
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(el => cio.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

});
