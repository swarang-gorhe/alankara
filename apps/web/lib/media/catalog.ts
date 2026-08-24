import type { ImageRole } from "./quality";

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  role: ImageRole;
};

/** High-resolution material and studio photography. Product photos stay on each product's own URL. */
export const MEDIA = {
  linenDrape: {
    id: "linen-drape",
    src: "/media/materials/linen-drape.jpg",
    alt: "Crumpled ivory linen with soft natural folds",
    caption: "Ivory linen",
    width: 2800,
    height: 4200,
    role: "hero",
  },
  creamFolds: {
    id: "cream-folds",
    src: "/media/materials/cream-folds.jpg",
    alt: "Close view of cream linen with a quiet crease and woven grain",
    caption: "Cloth",
    width: 2800,
    height: 1867,
    role: "lifestyle",
  },
  silkCream: {
    id: "silk-cream",
    src: "/media/materials/silk-cream.jpg",
    alt: "Layered cream textile curves in soft directional light",
    caption: "Layering",
    width: 2800,
    height: 4200,
    role: "hero",
  },
  threadWhite: {
    id: "thread-white",
    src: "/media/materials/thread-white.jpg",
    alt: "Rows of cream cotton thread wound on wooden mill bobbins",
    caption: "Thread",
    width: 2400,
    height: 1602,
    role: "detail",
  },
  threadVintage: {
    id: "thread-vintage",
    src: "/media/materials/thread-vintage.jpg",
    alt: "Wooden thread spools gathered on a studio table",
    caption: "Spools",
    width: 2400,
    height: 1800,
    role: "detail",
  },
  threadBrown: {
    id: "thread-brown",
    src: "/media/materials/thread-brown.jpg",
    alt: "Earth-toned cotton spools resting on woven ivory cloth",
    caption: "Warm threads",
    width: 2400,
    height: 1600,
    role: "detail",
  },
  yarnMacro: {
    id: "yarn-macro",
    src: "/media/materials/yarn-macro.jpg",
    alt: "Mustard thread cones on an ivory studio machine",
    caption: "Winding",
    width: 2333,
    height: 3500,
    role: "lifestyle",
  },
  pearls: {
    id: "pearls",
    src: "/media/materials/pearls-dish.jpg",
    alt: "Baroque freshwater pearls draped over linen and a ceramic dish",
    caption: "Pearls",
    width: 2160,
    height: 2160,
    role: "detail",
  },
  cutting: {
    id: "cutting",
    src: "/media/studio/cutting-fabric.jpg",
    alt: "Artisan cutting charcoal cloth at a bright textile table",
    caption: "Cut by hand",
    width: 2400,
    height: 3600,
    role: "lifestyle",
  },
} as const satisfies Record<string, MediaAsset>;

export const MATERIAL_CHAPTER: Array<{
  asset: MediaAsset;
  kicker: string;
  title: string;
  body: string;
}> = [
  {
    asset: MEDIA.creamFolds,
    kicker: "Fabric",
    title: "Cloth first",
    body: "Cotton and linen are cut, backed, and paired so each silhouette stays light on the ear — jewellery you can forget you are wearing, then remember all evening.",
  },
  {
    asset: MEDIA.threadWhite,
    kicker: "Threads",
    title: "Wound, not rushed",
    body: "Thread is chosen for drape and how it catches afternoon light. We work in small cones so colour stays honest from the first pair to the last.",
  },
  {
    asset: MEDIA.pearls,
    kicker: "Pearls",
    title: "Quiet luminosity",
    body: "Freshwater pearls are knotted where a piece needs a soft catch of light — never as costume, always as a single considered note.",
  },
  {
    asset: MEDIA.threadVintage,
    kicker: "Beads & ghungroos",
    title: "Components with weight",
    body: "Glass beads and tiny ghungroos are weighed in pairs so each drop moves as one. Hardware stays hypoallergenic and unobtrusive.",
  },
];

export type ProductMediaSet = {
  main: string;
  gallery: string[];
  lifestyle: string;
  thumbnail: string;
  detail: string;
};

const PRODUCT_LIFESTYLE: Record<string, ProductMediaSet> = {
  "kesari-diamond-drops": {
    main: "/products/kesari-diamond-drops.webp",
    gallery: [
      "/products/kesari-diamond-drops.webp",
      MEDIA.threadBrown.src,
      MEDIA.yarnMacro.src,
    ],
    lifestyle: MEDIA.yarnMacro.src,
    thumbnail: "/products/kesari-diamond-drops.webp",
    detail: MEDIA.creamFolds.src,
  },
  "cocoa-crescent-drops": {
    main: "/products/cocoa-crescent-drops.webp",
    gallery: [
      "/products/cocoa-crescent-drops.webp",
      MEDIA.threadVintage.src,
      MEDIA.creamFolds.src,
    ],
    lifestyle: MEDIA.silkCream.src,
    thumbnail: "/products/cocoa-crescent-drops.webp",
    detail: MEDIA.threadWhite.src,
  },
  "vanam-textile-studs": {
    main: "/products/vanam-textile-studs.webp",
    gallery: [
      "/products/vanam-textile-studs.webp",
      MEDIA.pearls.src,
      MEDIA.creamFolds.src,
    ],
    lifestyle: MEDIA.creamFolds.src,
    thumbnail: "/products/vanam-textile-studs.webp",
    detail: MEDIA.pearls.src,
  },
  "raga-heart-studs": {
    main: "/products/raga-heart-studs.webp",
    gallery: [
      "/products/raga-heart-studs.webp",
      MEDIA.linenDrape.src,
      MEDIA.threadBrown.src,
    ],
    lifestyle: MEDIA.linenDrape.src,
    thumbnail: "/products/raga-heart-studs.webp",
    detail: MEDIA.threadBrown.src,
  },
};

const FALLBACK_SET = (main: string): ProductMediaSet => ({
  main,
  gallery: [main, MEDIA.creamFolds.src, MEDIA.threadWhite.src],
  lifestyle: MEDIA.creamFolds.src,
  thumbnail: main,
  detail: MEDIA.silkCream.src,
});

/** Same product image URL everywhere — never generate a second version of a piece. */
export function getProductMedia(slug: string, images: string[] = []): ProductMediaSet {
  const known = PRODUCT_LIFESTYLE[slug];
  const main = images[0] ?? known?.main;
  if (known) {
    return {
      ...known,
      main: main ?? known.main,
      thumbnail: main ?? known.thumbnail,
      gallery: [main ?? known.main, ...known.gallery.filter((src) => src !== (main ?? known.main))],
    };
  }
  return FALLBACK_SET(main ?? MEDIA.creamFolds.src);
}

export const JOURNAL_STORIES = [
  {
    slug: "cloth-that-moves",
    title: "Cloth that moves with you",
    excerpt: "Why we build jewellery from textile — and why it should feel as light as a well-cut blouse.",
    image: MEDIA.creamFolds,
  },
  {
    slug: "little-moments",
    title: "Crafted for little moments",
    excerpt: "Festival mornings, last-minute dinners, Tuesdays that deserve a pair of drops.",
    image: MEDIA.silkCream,
  },
  {
    slug: "the-atelier-table",
    title: "At the atelier table",
    excerpt: "Cutting, folding, layering, finishing — the quiet choreography behind each pair.",
    image: MEDIA.cutting,
  },
] as const;
