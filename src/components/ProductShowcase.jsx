import { useState } from 'react';
import { scrollToSection } from '../hooks/useScrollAnimation.js';
import { sound } from '../hooks/sound.js';

export default function ProductShowcase() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | invalid | sent

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('invalid');
      return;
    }
    sound.select();
    setStatus('sent');
  };

  return (
    <>
      <section id="collection" className="showcase" aria-labelledby="product-title">
        <div className="showcase__left">
          <h2 id="product-title" className="showcase__name">AURELLE No. 1</h2>
          <p className="showcase__sub">Eau de Parfum · 50 ml</p>
          <p className="showcase__desc">
            Bergamot opens bright, rose turns the heart soft and full, and vanilla holds the finish for hours.
            A single bottle, made to be worn every day and remembered every evening.
          </p>
        </div>
        <div className="showcase__right">
          <p className="showcase__price">
            <span>$240</span>
            <small>Sample price</small>
          </p>
          <a
            href="#finale"
            className="btn btn--solid"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('finale');
            }}
            onPointerEnter={(e) => e.pointerType === 'mouse' && sound.hover()}
          >
            Discover the Collection
          </a>
        </div>
      </section>

      <section id="finale" className="finale" aria-labelledby="finale-title">
        <h2 id="finale-title" className="finale__title">Luxury is a fragrance that stays.</h2>
        <p className="finale__copy">Join the list and receive a complimentary sample of No. 1.</p>
        <form className="finale__form" onSubmit={submit} noValidate>
          <label htmlFor="sample-email" className="sr-only">Email address</label>
          <input
            id="sample-email"
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            aria-invalid={status === 'invalid'}
            aria-describedby="sample-msg"
          />
          <button type="submit" className="btn">Request a sample</button>
        </form>
        <p id="sample-msg" className="finale__msg" role="status" aria-live="polite">
          {status === 'invalid' && 'Please enter a valid email address.'}
          {status === 'sent' && 'Thank you. Your sample is on its way to the list.'}
        </p>
      </section>
    </>
  );
}
