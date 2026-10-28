# AURELLE — Luxury Perfume Website

React + Vite + GSAP ScrollTrigger, with scroll-controlled AI video scenes and Three.js gold particles. JavaScript only, plain CSS.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & preview
```bash
npm run build      # outputs ./dist
npm run preview    # serves the production build at http://localhost:4173
```

## Deploy
`dist/` is a static site.
- **Netlify / Cloudflare Pages / Vercel**: build command `npm run build`, output directory `dist`.
- **GitHub Pages / sub-folder hosting**: set `base: '/your-repo/'` in `vite.config.js`, then build and publish `dist/`.
- **Any server**: upload the contents of `dist/`.

## Scroll-controlled videos
Place MP4 files in `public/videos/`. Each video is loaded near its section, waits for metadata, and seeks to the frame corresponding to that section's ScrollTrigger progress; it does not play independently. The hero is pinned for one viewport of reveal; story and craftsmanship retain their existing sticky stages. Other sections continue normal scrolling, with the notes cards revealing sequentially as their video scrubs.

| Scene | File |
| --- | --- |
| Hero reveal | `perfume-1.mp4` |
| Fragrance story | `perfume-2.mp4` |
| Fragrance notes | `perfume-3.mp4` |
| Craftsmanship | `perfume-4.mp4` |
| Product showcase | `perfume-5.mp4` |
| Finale | `perfume-1.mp4` (reused) |

Scene assignments and scroll timing live in `src/App.jsx`; video loading and frame synchronization live in `src/components/ScrollControlledVideo.jsx`; responsive placement lives in `src/styles/scroll-videos.css`.

## Project map
- `src/hooks/sceneState.js` — shared keyframes and state used for scene lighting and particles.
- `src/hooks/useScrollAnimation.js` — section choreography and ScrollTrigger reveals.
- `src/components/PerfumeScene.jsx` — Canvas, lighting, and the retained gold-particle effect.
- `src/components/ScrollControlledVideo.jsx` — lazy video loading and reversible frame scrubbing.
- `src/components/PerfumeBottle.jsx` — legacy bottle renderer, no longer mounted by the app.
- `src/styles/*.css` — layout and styling only.

## Troubleshooting
- **Blank page / console error after install**: delete `node_modules` and `package-lock.json`, run `npm install` again (Node 18+ required).
- **Video missing**: confirm the MP4 exists under `public/videos/` and that the browser can decode it.
- **Choppy video seeking**: re-encode the MP4 with frequent keyframes and a web-friendly H.264 profile.
- **Choppy particle effect on a slow GPU**: lower `dprMax` or particle counts in `PerfumeScene.jsx`. A `PerformanceMonitor` already drops resolution automatically.
- **Scroll triggers off after changing layout**: call `ScrollTrigger.refresh()` after content height changes.
- **Fonts**: self-hosted via `@fontsource`, so no network request to Google Fonts.
- **Sound**: off by default; toggle in the navbar. Effects are synthesized, no audio files needed.
