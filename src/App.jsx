import PerfumeScene from './components/PerfumeScene.jsx';
import ScrollControlledVideo from './components/ScrollControlledVideo.jsx';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import StorySection from './components/StorySection.jsx';
import FragranceNotes from './components/FragranceNotes.jsx';
import CraftsmanshipSection from './components/CraftsmanshipSection.jsx';
import ProductShowcase from './components/ProductShowcase.jsx';
import Footer from './components/Footer.jsx';
import { useSceneScroll } from './hooks/useScrollAnimation.js';

export default function App() {
  useSceneScroll();
  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <ScrollControlledVideo
        scene="hero"
        src={`${import.meta.env.BASE_URL}videos/perfume-1.mp4`}
        triggerId="home"
        start="top top"
        end="+=100%"
        pin
        fit="contain"
      />
      <ScrollControlledVideo
        scene="story"
        src={`${import.meta.env.BASE_URL}videos/perfume-2.mp4`}
        triggerId="story"
        start="top top"
        end="bottom bottom"
      />
      <ScrollControlledVideo
        scene="notes"
        src={`${import.meta.env.BASE_URL}videos/perfume-3.mp4`}
        triggerId="fragrance"
        start="top bottom"
        end="bottom top"
      />
      <ScrollControlledVideo
        scene="craft"
        src={`${import.meta.env.BASE_URL}videos/perfume-4.mp4`}
        triggerId="craftsmanship"
        start="top top"
        end="bottom bottom"
      />
      <ScrollControlledVideo
        scene="collection"
        src={`${import.meta.env.BASE_URL}videos/perfume-5.mp4`}
        triggerId="collection"
        start="top top"
        end="bottom top"
        fit="contain"
      />
      <ScrollControlledVideo
        scene="finale"
        src={`${import.meta.env.BASE_URL}videos/perfume-1.mp4`}
        triggerId="finale"
        start="top bottom"
        end="bottom bottom"
      />
      <PerfumeScene />
      <a className="skip-link" href="#story">Skip to content</a>
      <Navbar />
      <main className="page">
        <HeroSection />
        <StorySection />
        <FragranceNotes />
        <CraftsmanshipSection />
        <ProductShowcase />
      </main>
      <Footer />
    </>
  );
}
