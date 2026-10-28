import { useRef } from 'react';
import { useStoryReveal } from '../hooks/useScrollAnimation.js';

export default function StorySection() {
  const ref = useRef(null);
  useStoryReveal(ref);

  return (
    <section id="story" className="story" ref={ref} aria-labelledby="story-title">
      <div className="story__stage">
        <div className="story__panel">
          <h2 id="story-title" className="story__title js-story">Composed in the hour after dusk</h2>
          <p className="js-story">
            AURELLE began with a single idea: a scent should not announce a person, it should remember them.
          </p>
          <p className="js-story">
            Each batch is composed over eleven months, then rested in amber glass until the notes settle into one voice.
          </p>
          <p className="js-story">
            Warm at first breath, deeper by evening, and still there on the collar of a coat the next morning.
          </p>
          <p className="story__sign js-story">“Luxury is a fragrance that stays.”</p>
        </div>
      </div>
    </section>
  );
}
