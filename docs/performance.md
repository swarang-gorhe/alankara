# Performance notes

Guidelines for keeping Alankara fast on mobile and low-end devices.

## Three.js / React Three Fiber (opening sequence)

The **Unwrap the Story** intro (`OpeningSequence`) uses **dynamic import** with `ssr: false` for atmosphere particles only:

```tsx
// apps/web/components/home/intro/OpeningSequence.tsx
const IntroAtmosphere3D = dynamic(
  () => import("./IntroAtmosphere3D").then((mod) => mod.IntroAtmosphere3D),
  { ssr: false },
);
```

**When 3D is skipped** (CSS/SVG keepsake box only):

- `prefers-reduced-motion: reduce` — entire pinned intro skipped
- `navigator.deviceMemory < 4` — particles disabled at runtime
- Mobile uses ~55 instanced particles vs ~120 on desktop

Pinned scroll distance is shorter on mobile (`280vh` vs `450vh`).

## Homepage hero (Chapter 5)

`Chapter5Hero` is static React + GSAP parallax pearls — no Three.js. The bloom moment lives in the opening sequence (Chapter 3) or the short return-visit bloom.

## Below-fold homepage chapters

Chapters 6–11 are standard React + GSAP — no additional Three.js bundles. GSAP animations are disabled when `usePrefersReducedMotion()` is true.

## Images

- Use `next/image` for all product and brand assets
- Pass `width` / `height` or `fill` with `sizes` for responsive srcset
- `ProductPlaceholder` accepts an optional `image` prop — swap fixture URLs for Supabase Storage public URLs in production

## Bundle splitting

- `@react-three/fiber`, `@react-three/drei`, and `three` are only imported inside intro atmosphere + legacy `WelcomeHero3D.tsx` (lazy chunks)
- Admin routes use a separate layout without Lenis, luxury cursor, or FAQ widget

## Lighthouse targets (Phase 8 exit criteria)

| Page | Target |
|------|--------|
| `/`, `/our-story`, `/artisans` | 95+ Performance (static content) |
| `/shop`, `/product/*` | 85+ (API-dependent) |

Run locally: `pnpm --filter @alankara/web build && npx lighthouse http://localhost:3000 --view`

## Production checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set on Vercel (canonical URLs, sitemap, OG)
- [ ] Railway API on same region as Supabase DB (latency)
- [ ] Enable Vercel image optimization for remote Supabase Storage URLs in `next.config.ts` when images go live
