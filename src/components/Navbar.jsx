import { useEffect, useState } from 'react';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToSection } from '../hooks/useScrollAnimation.js';
import { sound } from '../hooks/sound.js';

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'story', label: 'Our Story' },
  { id: 'fragrance', label: 'Fragrance' },
  { id: 'craftsmanship', label: 'Craftsmanship' },
  { id: 'collection', label: 'Collection' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const triggers = NAV_LINKS.map(({ id }) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => self.isActive && setActive(id),
      })
    );
    return () => {
      window.removeEventListener('scroll', onScroll);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    // wait one frame so the unlocked body can scroll after closing the mobile menu
    requestAnimationFrame(() => scrollToSection(id));
  };

  const toggleSound = () => {
    const next = !soundOn;
    sound.setEnabled(next);
    setSoundOn(next);
  };

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav__inner" aria-label="Primary">
        <a href="#home" className="nav__logo" onClick={(e) => go(e, 'home')} aria-label="AURELLE — home">
          AURELLE
        </a>

        <ul id="nav-menu" className={`nav__links ${open ? 'is-open' : ''}`}>
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active === id ? 'is-active' : ''}
                aria-current={active === id ? 'true' : undefined}
                onClick={(e) => go(e, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav__tools">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            {soundOn ? <Volume2 size={18} strokeWidth={1.3} /> : <VolumeX size={18} strokeWidth={1.3} />}
          </button>
          <button
            type="button"
            className="icon-btn nav__burger"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} strokeWidth={1.3} /> : <Menu size={22} strokeWidth={1.3} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
