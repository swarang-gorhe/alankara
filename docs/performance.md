# Performance notes

Guidelines for keeping Alankara fast on mobile and low-end devices.

## Three.js / React Three Fiber (homepage hero)

The cinematic hero (`WelcomeScene`) uses **dynamic import** with `ssr: false`:

```tsx
// apps/web/components/home/WelcomeScene.tsx
const WelcomeHero3D = dynamic(() => import("./WelcomeHero3D").then((m) => m.WelcomeHero3D), {
  ssr: false,
  loading: () => <WelcomeHeroFallback />,
});
```

**When 3D is skipped** (static gradient fallback instead):

- `prefers-reduced-motion: reduce`
- Touch / coarse-pointer devices (mobile)
- Viewport width below `md` (768px)

This keeps the hero lightweight on phones while preserving the full experience on desktop.

## Below-fold homepage scenes

All homepage sections after `WelcomeScene` are standard React + Framer Motion / GSAP — no additional Three.js bundles. GSAP animations are disabled when `usePrefersReducedMotion()` is true.

## Images

- Use `next/image` for all product and brand assets
- Pass `width` / `height` or `fill` with `sizes` for responsive srcset
- `ProductPlaceholder` accepts an optional `image` prop — swap fixture URLs for Supabase Storage public URLs in production

## Bundle splitting

- `@react-three/fiber`, `@react-three/drei`, and `three` are only imported inside `WelcomeHero3D.tsx` (lazy chunk)
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
