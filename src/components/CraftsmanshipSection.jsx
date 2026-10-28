import { useState } from 'react';
import { hotspotEls } from '../hooks/sceneState.js';
import { sound } from '../hooks/sound.js';

const HOTSPOTS = [
  {
    id: 'cap',
    side: 'right',
    title: 'The cap',
    text: 'Weighted brass finished in champagne gold. It closes with a soft, deliberate click.',
  },
  {
    id: 'glass',
    side: 'left',
    title: 'The glass',
    text: 'Thick-walled, hand-polished crystal that bends light through the liquid and keeps the scent pure.',
  },
  {
    id: 'fragrance',
    side: 'right',
    title: 'The fragrance',
    text: 'A concentrated eau de parfum, rested for months until bergamot, rose and vanilla speak as one.',
  },
];

export default function CraftsmanshipSection() {
  const [pinned, setPinned] = useState(null);
  const [hovered, setHovered] = useState(null);
  const shown = hovered ?? pinned;

  return (
    <section id="craftsmanship" className="craft" aria-labelledby="craft-title">
      <div className="craft__stage">
        <div className="craft__head">
          <h2 id="craft-title" className="section-title">Every surface is considered</h2>
          <p className="craft__hint">Select a point on the bottle to explore its details.</p>
        </div>

        <div className="hotspot-layer">
          {HOTSPOTS.map(({ id, side, title, text }) => (
            <div
              key={id}
              ref={(el) => {
                if (el) hotspotEls[id] = el;
                else delete hotspotEls[id];
              }}
              className={`hotspot hotspot--${side} ${shown === id ? 'is-open' : ''}`}
            >
              <button
                type="button"
                className="hotspot__dot"
                aria-expanded={pinned === id}
                aria-controls={`hs-${id}`}
                aria-label={title}
                onClick={() => {
                  sound.select();
                  setPinned(pinned === id ? null : id);
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'mouse') return;
                  sound.hover();
                  setHovered(id);
                }}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(null)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered(null)}
              />
              <div id={`hs-${id}`} className="hotspot__label" role="group" aria-label={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
