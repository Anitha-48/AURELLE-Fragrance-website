import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { scrollToSection } from '../hooks/useScrollAnimation.js';
import { sceneState } from '../hooks/sceneState.js';

export default function HeroSection() {
  const ref = useRef(null);

  // The brand copy reveals over the scroll-controlled hero video.
  useGSAP(
    () => {
      if (sceneState.reduced) return;
      gsap.from('.js-in', {
        autoAlpha: 0,
        y: 28,
        duration: 1.5,
        delay: 0.4,
        stagger: 0.22,
        ease: 'power3.out',
      });
    },
    { scope: ref }
  );

  return (
    <section id="home" className="hero" ref={ref} aria-labelledby="hero-title">
      <div className="hero__content">
        <h1 id="hero-title" className="hero__title js-in">AURELLE</h1>
        <p className="hero__kicker js-in">THE ART OF FINE FRAGRANCE</p>
        <p className="hero__tagline js-in">“Leave a lasting impression.”</p>
        <p className="hero__copy js-in">
          Discover a fragrance crafted to become part of your identity.
        </p>
        <a
          href="#story"
          className="btn js-in"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('story');
          }}
        >
          DISCOVER AURELLE
        </a>
      </div>
      <span className="hero__scroll" aria-hidden="true" />
    </section>
  );
}
