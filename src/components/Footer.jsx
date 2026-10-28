import { NAV_LINKS } from './Navbar.jsx';
import { scrollToSection } from '../hooks/useScrollAnimation.js';

const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/' },
  { label: 'YouTube', href: 'https://www.youtube.com/' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__logo">AURELLE</p>
          <p className="footer__tag">Luxury is a fragrance that stays.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="footer__links">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(id);
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="footer__links" aria-label="Social media">
          {SOCIAL.map(({ label, href }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            </li>
          ))}
        </ul>
      </div>
      <p className="footer__legal">© {new Date().getFullYear()} AURELLE Parfums. All rights reserved.</p>
    </footer>
  );
}
