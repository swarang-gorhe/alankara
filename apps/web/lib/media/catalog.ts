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

const PRODUCT_CONTEXT: Record<string, { lifestyle: string; detail: string }> = {
  "kesari-diamond-drops": {
    lifestyle: MEDIA.yarnMacro.src,
    detail: MEDIA.creamFolds.src,
  },
  "cocoa-crescent-drops": {
    lifestyle: MEDIA.silkCream.src,
    detail: MEDIA.threadWhite.src,
  },
  "vanam-textile-studs": {
    lifestyle: MEDIA.creamFolds.src,
    detail: MEDIA.pearls.src,
  },
  "raga-heart-studs": {
    lifestyle: MEDIA.linenDrape.src,
    detail: MEDIA.threadBrown.src,
  },
  "moti-pearl-choker": {
    lifestyle: MEDIA.pearls.src,
    detail: MEDIA.silkCream.src,
  },
  "meadow-floral-collar": {
    lifestyle: MEDIA.creamFolds.src,
    detail: MEDIA.linenDrape.src,
  },
  "ghungroo-wrap-bracelet": {
    lifestyle: MEDIA.threadVintage.src,
    detail: MEDIA.threadBrown.src,
  },
  "festival-matching-set": {
    lifestyle: MEDIA.yarnMacro.src,
    detail: MEDIA.creamFolds.src,
  },
};

const FALLBACK_SET = (main: string): ProductMediaSet => ({
  main,
  gallery: [main],
  lifestyle: MEDIA.creamFolds.src,
  thumbnail: main,
  detail: MEDIA.silkCream.src,
});

/**
 * Same product image URL everywhere — never generate a second version of a piece,
 * and never pad the gallery with unrelated stock stills as if they were extra angles.
 */
export function getProductMedia(slug: string, images: string[] = []): ProductMediaSet {
  const context = PRODUCT_CONTEXT[slug];
  const productImages = images.filter(Boolean);
  const main = productImages[0] ?? `/products/${slug}.webp`;
  if (!productImages.length && !context) {
    return FALLBACK_SET(MEDIA.creamFolds.src);
  }
  return {
    main,
    gallery: productImages.length > 0 ? productImages : [main],
    lifestyle: context?.lifestyle ?? MEDIA.creamFolds.src,
    thumbnail: main,
    detail: context?.detail ?? MEDIA.silkCream.src,
  };
}

export const JOURNAL_STORIES = [
  {
    slug: "cloth-that-moves",
    title: "Cloth that moves with you",
    excerpt: "Why we build jewellery from textile — and why it should feel as light as a well-cut blouse.",
    image: MEDIA.creamFolds,
    body: [
      "Most jewellery asks you to hold still. Ours is cut from cloth, so it can do what cloth does: fold, rest, and move with the person wearing it.",
      "We start with cotton and linen because they already know how to sit against skin. The silhouette is drawn, then backed just enough to keep its shape — never so much that the ear notices the weight. Beads, pearls, and ghungroos are added as notes, not as the whole composition.",
      "The result is jewellery you can forget until a glance in a window reminds you. That is the point: presence without performance, for the hours that do not wait for a special occasion.",
    ],
  },
  {
    slug: "little-moments",
    title: "Crafted for little moments",
    excerpt: "Festival mornings, last-minute dinners, Tuesdays that deserve a pair of drops.",
    image: MEDIA.silkCream,
    body: [
      "Alankara is named for adornment, not for spectacle. The pieces are made for the morning you want colour with chai, the dinner that was decided at six, the festival that begins before the house is ready.",
      "Bigger drops at one hundred and sixty rupees carry mustard, cocoa, and geometric bands. Smaller studs at one hundred and thirty sit close — forest, burgundy, a quiet heart of cloth. Same table, two tempos.",
      "We finish in small batches so a pair can leave the atelier the week it is asked for. Little moments do not wait for a lookbook.",
    ],
  },
  {
    slug: "the-atelier-table",
    title: "At the atelier table",
    excerpt: "Cutting, folding, layering, finishing — the quiet choreography behind each pair.",
    image: MEDIA.cutting,
    body: [
      "The table is ivory linen, wooden spools, and a pair of shears that already know the diamond and the crescent. Cloth is chosen for drape, then cut so each earring has a twin — not a copy, a counterpart.",
      "Folding gives the piece its body. Thread and lining close the form. Pearls and beads are weighed in pairs so the sway matches. Hooks are hypoallergenic and unobtrusive; the jewellery should not announce its hardware.",
      "When a pair is ready, it is nested in tissue and a reusable cotton pouch. Photography of the jewellery itself is still arriving. Until then, you will see each piece contained on linen — the same photograph everywhere, never cropped — beside the materials that actually made it.",
    ],
  },
] as const;

export type JournalStory = (typeof JOURNAL_STORIES)[number];

export function getJournalStory(slug: string): JournalStory | undefined {
  return JOURNAL_STORIES.find((story) => story.slug === slug);
}
