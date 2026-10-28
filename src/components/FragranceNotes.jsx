import { useRef, useState } from 'react';
import { useNotesReveal } from '../hooks/useScrollAnimation.js';
import { sound } from '../hooks/sound.js';

const stroke = { fill: 'none', stroke: '#C5A15B', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function BergamotArt() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" {...{ width: '100%', height: '100%' }}>
      <g {...stroke}>
        <circle cx="40" cy="40" r="30" />
        <circle cx="40" cy="40" r="25" opacity="0.6" />
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return <path key={i} d={`M40 40 L${40 + Math.cos(a) * 25} ${40 + Math.sin(a) * 25}`} opacity="0.7" />;
        })}
        <path d="M62 12c8-2 13 2 14 8-6 3-13 1-14-8z" />
      </g>
    </svg>
  );
}

function RoseArt() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" {...{ width: '100%', height: '100%' }}>
      <g {...stroke}>
        <circle cx="40" cy="40" r="6" />
        <path d="M40 34c8-2 14 4 12 12s-12 12-20 6-6-18 4-22 22 0 24 14" />
        <path d="M40 22c14-6 30 6 26 22s-22 24-36 14S14 36 24 26" opacity="0.7" />
        <path d="M40 74c0-14 2-18 8-22" opacity="0.6" />
      </g>
    </svg>
  );
}

function VanillaArt() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" {...{ width: '100%', height: '100%' }}>
      <g {...stroke}>
        <path d="M14 66C30 60 50 38 64 10" />
        <path d="M18 70C36 64 56 42 68 14" opacity="0.7" />
        <path d="M14 66l4 4" />
        <path d="M64 10l4 4" />
        <circle cx="54" cy="58" r="3" />
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return <ellipse key={i} cx={54 + Math.cos(a) * 9} cy={58 + Math.sin(a) * 9} rx="5" ry="3" transform={`rotate(${(a * 180) / Math.PI} ${54 + Math.cos(a) * 9} ${58 + Math.sin(a) * 9})`} />;
        })}
      </g>
    </svg>
  );
}

const NOTES = [
  {
    id: 'bergamot',
    name: 'Bergamot',
    stage: 'Top note',
    line: 'Fresh citrus opening.',
    detail:
      'Cold-pressed Calabrian peel gives the first ten minutes a bright, green-gold sparkle that lifts off the skin.',
    Art: BergamotArt,
  },
  {
    id: 'rose',
    name: 'Rose',
    stage: 'Heart note',
    line: 'Elegant floral heart.',
    detail:
      'Damask rose absolute turns the fragrance soft and full, with a velvety petal depth that arrives as the citrus fades.',
    Art: RoseArt,
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    stage: 'Base note',
    line: 'Warm, lasting finish.',
    detail:
      'Slow-cured vanilla pod and amber hold the drydown for hours, leaving a warm trail that stays on fabric and skin.',
    Art: VanillaArt,
  },
];

export default function FragranceNotes() {
  const ref = useRef(null);
  const [openId, setOpenId] = useState(null);
  useNotesReveal(ref);

  return (
    <section id="fragrance" className="notes" ref={ref} aria-labelledby="notes-title">
      <div className="notes__col">
        <h2 id="notes-title" className="section-title">Three notes, one memory</h2>
        <p className="notes__intro">Tap or hover a note to see how it unfolds on the skin.</p>
        <ul className="notes__list">
          {NOTES.map(({ id, name, stage, line, detail, Art }) => {
            const isOpen = openId === id;
            return (
              <li key={id} className="js-note">
                <button
                  type="button"
                  className={`note ${isOpen ? 'is-open' : ''}`}
                  aria-expanded={isOpen}
                  onClick={() => {
                    sound.select();
                    setOpenId(isOpen ? null : id);
                  }}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && sound.hover()}
                >
                  <span className="note__art"><Art /></span>
                  <span className="note__body">
                    <span className="note__stage">{stage}</span>
                    <span className="note__name">{name}</span>
                    <span className="note__line">{line}</span>
                    <span className="note__more">
                      <span className="note__more-inner">{detail}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
