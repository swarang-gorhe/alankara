# Alankara — "TRY IT ON" Virtual Try-On Architecture

Source of truth for the Try It On feature. Implement phases one at a time; do not invent scope beyond the current phase.

## Alankara adaptations

This monorepo differs from a generic Next-only + UUID-customers stack:

| Spec assumption | Alankara reality |
|---|---|
| UUID `products.id` | `VARCHAR(64)` (`prod-…`) — try-on FKs use string product IDs |
| `customer_id → customers(id)` | No `customers` table — `customer_id` is nullable `VARCHAR(64)` with no FK (same pattern as `customer_events`) |
| Direct Supabase admin writes | Admin mutates via FastAPI + Next `/api/admin` proxy |
| Single Supabase SQL migration | Dual: Alembic (`apps/api/alembic`) for local/dev + twin SQL under `supabase/migrations/` for production |

Admin try-on config lives at `/admin/products/[id]/try-on-config` (also reachable via `/atelier/...` rewrite).

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js App Router + React + TypeScript | SSR product pages; CSR try-on modal |
| Styling | Tailwind + Alankara tokens (ivory, maroon, champagne gold, blush, serif) | Brand consistency |
| Face/landmark detection | MediaPipe Face Landmarker (Tasks Vision, WASM/GPU), client-side | No camera frames leave the device |
| Ear position | Derived from jaw/temple landmarks + per-product offsets | Face Mesh has no native ear landmarks |
| Rendering | Canvas 2D for simple cases; Three.js + WebGL for perspective | Head rotation needs depth |
| Animation loop | `requestAnimationFrame`, inference throttled ~24–30fps | Performance + battery |
| Photo mode | Same landmark pipeline once on a static image | Reuses live path |
| Backend | FastAPI (`apps/api`) + Postgres; Supabase Storage when configured | Existing Alankara pattern |
| Storage | Private/signed URLs only for customer photos | Privacy |
| Admin | Next.js `/admin` (Atelier) | Try-on config + requests |
| Analytics | `try_on_events` table | Conversion funnel |

## 2. High-level data flow

```
Camera / Photo Input
        │
        ▼
MediaPipe Face Landmarker (client-side, WASM)
        │
        ▼
Landmark → Ear Anchor Estimation (jaw/temple + product offset)
        │
        ▼
Earring Placement Engine (position, rotation, scale, perspective)
        │
        ▼
Three.js / WebGL Compositor → Canvas Preview
        │
        ▼
Preview (Before/After, manual nudge)
        │
        ├──► "Order This" → product page
        └──► "Share My Look" → (opt-in) upload → try_on_requests → Admin
```

## 3. Database schema

```sql
-- products columns
alter table products add column try_on_enabled boolean default false;
alter table products add column try_on_asset_url text;
alter table products add column try_on_scale numeric default 1.0;
alter table products add column try_on_left_offset_x numeric default 0;
alter table products add column try_on_left_offset_y numeric default 0;
alter table products add column try_on_right_offset_x numeric default 0;
alter table products add column try_on_right_offset_y numeric default 0;
alter table products add column try_on_rotation numeric default 0;
alter table products add column try_on_vertical_offset numeric default 0;

-- try_on_requests (product_id is VARCHAR FK; customer_id has no FK)
-- try_on_events (session analytics)
```

See Alembic `007_try_on` and `supabase/migrations/000004_try_on.sql` for the applied definition.

A scheduled job should delete unconfirmed `photo_url` files older than N days (Phase 6+).

## 4. Frontend component map

```
/components/try-on/
  TryOnButton.tsx
  TryOnModal.tsx
  TryOnHeader.tsx
  ModeTabs.tsx
  LiveCameraView.tsx
  PhotoUploadView.tsx
  EarringOverlayCanvas.tsx
  BeforeAfterToggle.tsx
  ManualAdjustControls.tsx
  ShareMyLookForm.tsx
  ErrorStates.tsx
  useFaceLandmarker.ts
  useEarAnchors.ts
  tryOnAnalytics.ts

/app/admin/try-on-requests/
  page.tsx
  [id]/page.tsx

/app/admin/products/[id]/try-on-config/
  page.tsx
```

## 5. Placement math

1. Get 478 face landmarks (normalized 0–1 + depth).
2. Prefer MediaPipe `facialTransformationMatrix` for head pose.
3. Derive raw left/right ear anchors from temple/jaw indices (~234/454 region).
4. Apply product offsets (`try_on_left_offset_*`, `try_on_right_offset_*`, scale, rotation, vertical offset).
5. Place transparent try-on PNG planes in Three.js; scale by interocular distance.
6. Composite at throttled rate over video/photo base layer.

Per-product calibration (admin Phase 1) matters more than generic ear detection. Manual nudge controls (Phase 5) are the safety net.

## 6. Privacy

- Landmark detection and AR rendering run 100% in-browser.
- Upload a frame only on explicit "Share with Alankara" / "Share My Look".
- Show consent copy before any camera permission prompt.
- Customer photos use private storage + signed URLs only.

## 7. Hard constraints

1. Never send camera frames/video to any backend automatically.
2. Photo upload is a single explicit, auditable action.
3. Match Alankara visual identity — no neon AR / cyberpunk / blue-gradient UI.
4. Every earring needs its own try-on calibration — never one hardcoded placement.
5. Manual correction controls in photo mode.
6. Graceful on-brand error states with fallbacks.
7. Try-on asset must be the approved transparent PNG/WebP from admin — no AI-generated product imagery.
8. AI customization suggestions are admin-editable only — never auto-apply to orders.

## 8. Phased build plan

| Phase | Focus |
|---|---|
| 1 | Data layer + admin try-on config UI |
| 2 | TryOnButton + modal shell |
| 3 | Live camera + MediaPipe landmarks |
| 4 | Three.js earring compositing |
| 5 | Photo mode + before/after + manual adjust |
| 6 | Share / Order + private upload |
| 7 | Admin try-on requests + AI customization parser |
| 8 | Analytics events + dashboard card |

Cap live-camera mode to browsers with OffscreenCanvas + WebGL2; otherwise route to Photo mode.
