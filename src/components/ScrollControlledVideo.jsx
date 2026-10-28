import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollControlledVideo({
  scene,
  src,
  triggerId,
  start,
  end,
  fit = 'cover',
  pin = false,
}) {
  const layerRef = useRef(null);
  const videoRef = useRef(null);

  useGSAP(() => {
    const layer = layerRef.current;
    const video = videoRef.current;
    const trigger = document.getElementById(triggerId);
    if (!layer || !video || !trigger) {
      console.error(`[AURELLE] Video scene "${scene}" has no matching section: #${triggerId}`);
      return;
    }

    const playhead = { progress: 0 };
    let loaded = false;
    let progress = 0;
    let syncFrameId = 0;
    let seekInFlight = false;

    const loadVideo = () => {
      if (loaded) return;
      loaded = true;
      video.preload = 'metadata';
      video.src = src;
      video.load();
    };

    const syncFrame = () => {
      if (video.readyState < 1 || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const lastFrameTime = Math.max(0, video.duration - 0.04);
      const targetTime = Math.min(progress * video.duration, lastFrameTime);
      if (!seekInFlight && !video.seeking && Math.abs(video.currentTime - targetTime) > 0.02) {
        seekInFlight = true;
        video.currentTime = targetTime;
      }
    };

    const scheduleFrameSync = () => {
      if (syncFrameId) return;
      syncFrameId = window.requestAnimationFrame(() => {
        syncFrameId = 0;
        syncFrame();
      });
    };

    const updateFrame = () => {
      progress = playhead.progress;
      scheduleFrameSync();
    };
    const activate = () => {
      loadVideo();
      layer.classList.add('is-active');
    };
    const deactivate = () => layer.classList.remove('is-active');
    const onLoadedMetadata = () => {
      video.pause();
      scheduleFrameSync();
    };
    const onFrameReady = () => {
      if (!video.seeking) layer.classList.add('is-ready');
    };
    const onSeeked = () => {
      seekInFlight = false;
      scheduleFrameSync();
      onFrameReady();
    };
    const onMediaError = () => {
      seekInFlight = false;
      console.error(`[AURELLE] Could not load scroll-controlled video: ${src}`, video.error);
    };
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onFrameReady);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onMediaError);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadVideo();
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(trigger);

    const pinMedia = window.matchMedia(
      '(min-width: 761px) and (prefers-reduced-motion: no-preference)'
    );
    let animation;
    const createScrollAnimation = () => {
      animation?.scrollTrigger?.kill();
      animation?.kill();
      deactivate();
      animation = gsap.to(playhead, {
        progress: 1,
        ease: 'none',
        onUpdate: updateFrame,
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: true,
          pin: pin && pinMedia.matches ? trigger : false,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onEnter: activate,
          onEnterBack: activate,
          onLeave: deactivate,
          onLeaveBack: deactivate,
        },
      });
      if (animation.scrollTrigger?.isActive) activate();
      ScrollTrigger.refresh();
    };
    createScrollAnimation();
    pinMedia.addEventListener('change', createScrollAnimation);

    return () => {
      observer.disconnect();
      pinMedia.removeEventListener('change', createScrollAnimation);
      animation?.scrollTrigger?.kill();
      animation?.kill();
      if (syncFrameId) window.cancelAnimationFrame(syncFrameId);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onFrameReady);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onMediaError);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, { scope: layerRef });

  return (
    <div
      ref={layerRef}
      className={`scroll-video-scene scroll-video-scene--${scene}`}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className={`scroll-video-scene__video scroll-video-scene__video--${fit}`}
        muted
        playsInline
        preload="none"
        tabIndex={-1}
      />
    </div>
  );
}
