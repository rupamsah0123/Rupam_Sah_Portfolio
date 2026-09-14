document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 
     MOBILE NAV — runs first, fully guarded. A missing element
     anywhere else in this file must never be able to stop this
     from working.
      */
  (function initMobileNav(){
    const burger = document.getElementById('burgerBtn');
    const mobilePanel = document.getElementById('mobilePanel');
    if(!burger || !mobilePanel) return;

    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    mobilePanel.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape, and close if the viewport is resized past the
    // mobile breakpoint while the panel happens to be open.
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && document.body.classList.contains('nav-open')){
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('resize', () => {
      if(window.innerWidth > 880 && document.body.classList.contains('nav-open')){
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  /*  Hero typewriter intro ("Hi, I am Rupam Sah")  */
  (function initHeroTypewriter(){
    const el = document.getElementById('heroTypewriter');
    if(!el) return;

    const phrases = ['Hi, I am Rupam Sah'];

    if(reduceMotion){
      el.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const TYPE_SPEED = 90;
    const DELETE_SPEED = 45;
    const HOLD_AFTER_TYPE = 1400;
    const HOLD_AFTER_DELETE = 500;

    function tick(){
      const current = phrases[phraseIndex];

      if(!deleting){
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if(charIndex === current.length){
          deleting = true;
          setTimeout(tick, HOLD_AFTER_TYPE);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if(charIndex === 0){
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, HOLD_AFTER_DELETE);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    }

    tick();
  })();

  /* ---------- Theme toggle (light / dark) ---------- */
  (function initThemeToggle(){
    const themeButtons = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')].filter(Boolean);
    if(!themeButtons.length) return;
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
  })();

  /*  Publication filters  */
  (function initPubFilters(){
    const pubFilters = document.querySelectorAll('.pub-filter');
    const pubs = document.querySelectorAll('.pub');
    if(!pubFilters.length) return;
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
  })();

  /*  Copy-to-clipboard buttons  */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try{ await navigator.clipboard.writeText(text); } catch(e){ /* mailto link still works */ }
      const original = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1600);
    });
  });

  /*  Scroll progress bar  */
  const progressBar = document.getElementById('progressBar');
  function updateProgress(){
    if(!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /*  Back to top button  */
  const toTop = document.getElementById('toTop');
  function updateToTop(){
    if(!toTop) return;
    toTop.classList.toggle('show', window.scrollY > 480);
  }
  if(toTop){
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /*  Active nav link on scroll  */
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = Array.from(navLinks)
    .map(link => { try{ return document.querySelector(link.getAttribute('href')); } catch(e){ return null; } })
    .filter(Boolean);

  function updateActiveNav(){
    if(!sections.length) return;
    let currentId = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => { if(sec.offsetTop <= scrollPos){ currentId = sec.id; } });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  /*  Sticky header shadow once page has scrolled  */
  const siteHeader = document.getElementById('siteHeader');
  function updateHeaderShadow(){
    if(!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  }

  /*  Combined scroll handler (throttled via rAF) */
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

  /*  Scroll-triggered reveal, staggered by position within its group  */
  const revealEls = document.querySelectorAll('.reveal');
  const groupCounters = new WeakMap();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    const n = groupCounters.get(parent) || 0;
    if(!reduceMotion){ el.style.setProperty('--reveal-delay', Math.min(n, 4) * 90 + 'ms'); }
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

  /*  Hero scroll cue  */
  const scrollCue = document.getElementById('scrollCue');
  if(scrollCue){
    scrollCue.addEventListener('click', () => {
      const about = document.getElementById('about');
      if(about){ about.scrollIntoView({ behavior: 'smooth' }); }
    });
  }

  /*  Hero spotlight follows the cursor  */
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

  /*  Ambient spotlight for any other section that opts in  */
  if(window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.fx-spot-target').forEach(section => {
      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty('--mx', x + '%');
        section.style.setProperty('--my', y + '%');
      });
    });
  }

  /*  Button hover glow follows the cursor  */
  if(window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', ((e.clientX - r.left) / r.width) * 100 + '%');
        btn.style.setProperty('--by', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });
  }

  /*  Subtle 3D tilt on cards  */
  if(!reduceMotion && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.tilt-card').forEach(card => {
      const strength = 8;
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

  /*  Animated stat counters  */
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
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if(p < 1){ requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }
  if(counters.length){
    if('IntersectionObserver' in window){
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){ animateCounter(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(el => cio.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /*  Animated number-draw on eyebrow accent lines  */
  // Handled purely in CSS via .reveal.in — see .eyebrow::before transition in style.css

});
