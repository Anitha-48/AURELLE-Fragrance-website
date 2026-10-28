import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KEYFRAMES as K, sceneState } from './sceneState.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

/** Smooth-scroll to a section by id (respects reduced motion). */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY,
    behavior: sceneState.reduced ? 'auto' : 'smooth',
  });
}

/**
 * Master scroll choreography. Call once from <App />.
 * Each segment tweens the shared sceneState between two keyframes over a
 * non-overlapping scroll range, so forward and reverse scrolling always agree.
 */
export function useSceneScroll() {
  useGSAP(() => {
    const scrub = sceneState.reduced ? true : 1;

    const segment = (from, to, trigger, start, end) =>
      gsap.fromTo(
        sceneState,
        { ...from },
        {
          ...to,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger, start, end, scrub, invalidateOnRefresh: true },
        }
      );

    // The amber lighting and halo build as the story section arrives.
    segment(K.hero, K.story0, '#story', 'top bottom', 'top top');
    // Story stage: the backdrop and lighting warm with the video.
    segment(K.story0, K.story1, '#story', 'top top', 'bottom bottom');
    // Transition the shared lighting into the fragrance notes.
    segment(K.story1, K.notes, '#fragrance', 'top bottom', 'top top');
    // Craft stage: retain the lighting progression without the 3D bottle.
    segment(K.notes, K.craft0, '#craftsmanship', 'top bottom', 'top top');
    segment(K.craft0, K.craft1, '#craftsmanship', 'top top', 'bottom bottom');
    // Build the golden halo for the product reveal and finale.
    segment(K.craft1, K.show, '#collection', 'top bottom', 'top top');
    segment(K.show, K.finale, '#finale', 'top bottom', 'top 35%');

    // Hotspots are only aligned while the craftsmanship stage is stuck to the viewport.
    ScrollTrigger.create({
      trigger: '#craftsmanship',
      start: 'top top',
      end: 'bottom bottom',
      onToggle: (self) => {
        sceneState.craftLive = self.isActive;
        document.querySelector('.hotspot-layer')?.classList.toggle('is-live', self.isActive);
      },
    });

    // Hero copy fades away as the user scrolls
    gsap.to('.hero__content', {
      autoAlpha: 0,
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: '#home', start: 'top top', end: '65% top', scrub: true },
    });

    // Scene 1 reveal (own property: sceneState.reveal)
    if (sceneState.reduced) sceneState.reveal = 1;
    else gsap.to(sceneState, { reveal: 1, duration: 3, delay: 0.3, ease: 'power2.out' });

    // Layout shifts after fonts load would misplace the triggers
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
}

/** Scene 2 copy: staggered fade-in scrubbed by scroll (fully reversible). */
export function useStoryReveal(ref) {
  useGSAP(
    () => {
      if (sceneState.reduced) return;
      const lines = gsap.utils.toArray('.js-story');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 40%', end: 'bottom bottom', scrub: 0.6 },
      });
      tl.fromTo(
        lines,
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, stagger: 0.25, duration: 0.5, ease: 'power2.out' }
      );
      tl.to({}, { duration: 0.8 });
    },
    { scope: ref }
  );
}

/** Scene 3: note cards rise in; reverses when scrolling back up. */
export function useNotesReveal(ref) {
  useGSAP(
    () => {
      if (sceneState.reduced) return;
      gsap.fromTo(
        '.js-note',
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    { scope: ref }
  );
}
