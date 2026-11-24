import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;
let introductionPlayed = false;

export function initMotion() {
  if (initialized) return;
  initialized = true;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Changing the OS preference or breakpoint reverts the previous context.
  const media = gsap.matchMedia();
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 951px) and (hover: hover) and (pointer: fine)',
  }, context => {
    if (!context.conditions.motion) return;
    const { desktop } = context.conditions;
    const events = new AbortController();
    const options = { signal: events.signal };
    const ambientAnimations = new Map();

    function updatePlayback() {
      const active = document.visibilityState === 'visible' && !document.querySelector('dialog[open]');
      ambientAnimations.forEach(({ animation, visible }) => {
        if (active && visible) animation.play();
        else animation.pause();
      });
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = ambientAnimations.get(entry.target);
        if (item) item.visible = entry.isIntersecting;
      });
      updatePlayback();
    }, { threshold: 0.05 });

    function ambient(element, animation) {
      if (!element) return;
      ambientAnimations.set(element, { animation, visible: false });
      observer.observe(element);
    }

    document.addEventListener('visibilitychange', updatePlayback, options);
    document.addEventListener('aetheria:dialog-open', updatePlayback, options);
    document.addEventListener('aetheria:dialog-dismissed', updatePlayback, options);

    if (!introductionPlayed && window.scrollY < 100) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.header-inner', { autoAlpha: 0, y: -10, duration: 0.7, clearProps: 'all' }, 0)
        .from('.hero-eyebrow', { autoAlpha: 0, y: 10, duration: 0.7, clearProps: 'all' }, 0.12)
        .from('.headline-text', { yPercent: 105, duration: 1.05, stagger: 0.12, clearProps: 'transform' }, 0.15)
        .from('.hero-visual', { autoAlpha: 0, y: 24, duration: 1.35, clearProps: 'all' }, 0.2)
        .from(['.hero-description', '.hero-actions', '.hero-connection'], {
          autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.1, clearProps: 'all',
        }, 0.5);
    }
    introductionPlayed = true;

    // Reveal each block once; nothing is hidden in the stylesheet.
    const blocks = gsap.utils.toArray([
      '.section-heading', '.link-card', '.tech-copy',
      '.experience-inner > div:first-child', '.wave-art',
      '.design-heading', '.design-image-main', '.design-details',
      '.specs-intro', '.specs-table', '.faq-heading',
      '.faq-list', '.closing-inner',
    ].join(','));
    blocks.forEach(element => {
      gsap.from(element, {
        opacity: 0, y: desktop ? 30 : 18, duration: 0.85, ease: 'power2.out',
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: element, start: 'top 94%', once: true },
      });
    });
    gsap.from('.stat', {
      opacity: 0, y: 16, duration: 0.7, stagger: 0.09, ease: 'power2.out',
      clearProps: 'all',
      scrollTrigger: { trigger: '.stats-section', start: 'top 96%', once: true },
    });

    gsap.to('.reading-progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: true },
    });
    ScrollTrigger.create({
      start: 24, end: 'max',
      toggleClass: { targets: '.site-header', className: 'is-scrolled' },
    });

    const float = gsap.to('.product-float', {
      y: desktop ? -9 : -4, duration: 3.6, ease: 'sine.inOut',
      yoyo: true, repeat: -1, paused: true,
    });
    ambient(document.querySelector('.hero-visual'), float);

    const signal = gsap.timeline({ repeat: -1, paused: true });
    signal.fromTo('.signal-orbit', { scale: 0.9, opacity: 0.75 }, {
      scale: 1.12, opacity: 0.12, duration: 2.8, stagger: 0.32,
      ease: 'sine.inOut', yoyo: true, repeat: 1,
    });
    ambient(document.querySelector('.link-card'), signal);

    const waveform = gsap.to('.wave-lines i:nth-child(2n)', {
      scaleY: 0.45, duration: 1.25, stagger: { each: 0.035, from: 'center' },
      ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
    });
    ambient(document.querySelector('.wave-art'), waveform);

    if (desktop) {
      const visual = document.querySelector('.hero-visual');
      const image = document.querySelector('.hero-product');
      gsap.set(image, { transformPerspective: 1000 });
      const rotateX = gsap.quickTo(image, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      const rotateY = gsap.quickTo(image, 'rotationY', { duration: 0.8, ease: 'power3.out' });
      visual.addEventListener('pointermove', event => {
        const rect = visual.getBoundingClientRect();
        rotateX((0.5 - (event.clientY - rect.top) / rect.height) * 3);
        rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 5);
      }, { ...options, passive: true });
      visual.addEventListener('pointerleave', () => { rotateX(0); rotateY(0); }, options);

      gsap.to('.phantom-word', {
        yPercent: 30, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    }

    // Event animations are added to the context so preference changes clean them up.
    context.add('changeMode', () => {
      gsap.fromTo('.experience-panel', { autoAlpha: 0, y: 9 }, {
        autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out',
        clearProps: 'all', overwrite: true,
      });
      moveTabIndicator(true);
    });
    context.add('openDialog', event => {
      const { dialog } = event.detail;
      delete dialog.dataset.closing;
      gsap.fromTo(dialog, { autoAlpha: 0, y: 18, scale: 0.98 }, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.38,
        ease: 'power3.out', clearProps: 'all', overwrite: true,
      });
    });
    context.add('closeDialog', event => {
      event.preventDefault();
      const { dialog } = event.detail;
      if (dialog.dataset.closing) return;
      dialog.dataset.closing = 'true';
      gsap.to(dialog, {
        autoAlpha: 0, y: 10, scale: 0.985, duration: 0.2, ease: 'power2.in', overwrite: true,
        onComplete() {
          dialog.close();
          delete dialog.dataset.closing;
          gsap.set(dialog, { clearProps: 'all' });
        },
      });
    });
    context.add('galleryView', () => {
      gsap.fromTo('.gallery-frame img', { opacity: 0.6 }, {
        opacity: 1, duration: 0.4, overwrite: true, clearProps: 'opacity',
      });
    });
    context.add('menuOpen', () => {
      gsap.fromTo('#mobile-nav > *', { autoAlpha: 0, y: -6 }, {
        autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.04,
        clearProps: 'all', overwrite: true,
      });
    });

    document.addEventListener('aetheria:mode-change', context.changeMode, options);
    document.addEventListener('aetheria:dialog-open', context.openDialog, options);
    document.addEventListener('aetheria:dialog-close', context.closeDialog, options);
    document.addEventListener('aetheria:gallery-view', context.galleryView, options);
    document.addEventListener('aetheria:menu-open', context.menuOpen, options);

    const indicator = document.querySelector('.tab-indicator');
    const tabContainer = document.querySelector('.experience-tabs');
    function moveTabIndicator(animate = false) {
      const selected = tabContainer.querySelector('[aria-selected="true"]');
      const values = { x: selected.offsetLeft, width: selected.offsetWidth, duration: animate ? 0.4 : 0, ease: 'power3.out', overwrite: true };
      gsap.to(indicator, values);
    }
    moveTabIndicator();
    const resize = new ResizeObserver(() => moveTabIndicator());
    resize.observe(tabContainer);

    document.querySelectorAll('.faq-list details').forEach(details => {
      const summary = details.querySelector('summary');
      const answer = details.querySelector('.faq-answer');
      summary.addEventListener('click', contextSafeToggle, options);
      function contextSafeToggle(event) {
        event.preventDefault();
        context.add(() => {
          const closing = details.open && !details.dataset.closing;
          gsap.killTweensOf(answer);
          if (closing) {
            details.dataset.closing = 'true';
            gsap.to(answer, {
              height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut',
              onComplete() {
                details.open = false;
                delete details.dataset.closing;
                gsap.set(answer, { clearProps: 'height,opacity' });
                ScrollTrigger.refresh();
              },
            });
          } else {
            delete details.dataset.closing;
            const wasOpen = details.open;
            details.open = true;
            gsap.fromTo(answer, { height: wasOpen ? answer.getBoundingClientRect().height : 0, opacity: 0 }, {
              height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out',
              clearProps: 'height,opacity', onComplete: () => ScrollTrigger.refresh(),
            });
          }
        });
      }
    });

    document.documentElement.classList.add('motion-enabled');
    document.fonts.ready.then(() => {
      if (!events.signal.aborted) { ScrollTrigger.refresh(); moveTabIndicator(); }
    });

    return () => {
      events.abort();
      observer.disconnect();
      resize.disconnect();
      ambientAnimations.forEach(({ animation }) => animation.pause());
      document.documentElement.classList.remove('motion-enabled');
      document.querySelectorAll('dialog[data-closing]').forEach(dialog => {
        delete dialog.dataset.closing;
        dialog.close();
      });
      document.querySelectorAll('details[data-closing]').forEach(details => {
        delete details.dataset.closing;
        details.open = false;
      });
    };
  });
}
