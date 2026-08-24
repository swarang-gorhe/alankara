import { MEDIA } from "@/lib/media";

export type StoryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  span: string;
};

export const STORY_IMAGES: StoryImage[] = [
  {
    id: "studio",
    src: MEDIA.cutting.src,
    alt: MEDIA.cutting.alt,
    caption: "Cut by hand",
    width: MEDIA.cutting.width,
    height: MEDIA.cutting.height,
    span: "col-span-2 row-span-2",
  },
  {
    id: "pearls",
    src: MEDIA.pearls.src,
    alt: MEDIA.pearls.alt,
    caption: "Pearls",
    width: MEDIA.pearls.width,
    height: MEDIA.pearls.height,
    span: "col-span-1 row-span-1",
  },
  {
    id: "linen",
    src: MEDIA.creamFolds.src,
    alt: MEDIA.creamFolds.alt,
    caption: "Cloth",
    width: MEDIA.creamFolds.width,
    height: MEDIA.creamFolds.height,
    span: "col-span-1 row-span-1",
  },
  {
    id: "thread",
    src: MEDIA.threadWhite.src,
    alt: MEDIA.threadWhite.alt,
    caption: "Thread",
    width: MEDIA.threadWhite.width,
    height: MEDIA.threadWhite.height,
    span: "col-span-1 row-span-1",
  },
  {
    id: "spools",
    src: MEDIA.threadVintage.src,
    alt: MEDIA.threadVintage.alt,
    caption: "Spools",
    width: MEDIA.threadVintage.width,
    height: MEDIA.threadVintage.height,
    span: "col-span-1 row-span-1",
  },
  {
    id: "layers",
    src: MEDIA.silkCream.src,
    alt: MEDIA.silkCream.alt,
    caption: "Layering",
    width: MEDIA.silkCream.width,
    height: MEDIA.silkCream.height,
    span: "col-span-2 row-span-1 md:col-span-1",
  },
];

export const PROCESS_STEPS = [
  {
    id: "cloth",
    title: "Cloth, chosen",
    description:
      "Cotton and linen are selected for weight and drape, then laid on the table in the colour of the pair.",
    image: MEDIA.creamFolds.src,
    alt: MEDIA.creamFolds.alt,
    width: MEDIA.creamFolds.width,
    height: MEDIA.creamFolds.height,
  },
  {
    id: "cut",
    title: "Cut & fold",
    description:
      "Silhouettes are drawn, then cut and folded so diamond drops, crescents, and studs keep their shape without heaviness.",
    image: MEDIA.cutting.src,
    alt: MEDIA.cutting.alt,
    width: MEDIA.cutting.width,
    height: MEDIA.cutting.height,
  },
  {
    id: "assemble",
    title: "Pearls, beads, ghungroos",
    description:
      "Components are knotted and weighed in pairs so each piece moves softly — never louder than the cloth.",
    image: MEDIA.pearls.src,
    alt: MEDIA.pearls.alt,
    width: MEDIA.pearls.width,
    height: MEDIA.pearls.height,
  },
  {
    id: "finish",
    title: "Hand finishing",
    description:
      "Hooks, backs, and lining are set by hand. Every pair is checked, then nested in a reusable cotton pouch.",
    image: MEDIA.threadBrown.src,
    alt: MEDIA.threadBrown.alt,
    width: MEDIA.threadBrown.width,
    height: MEDIA.threadBrown.height,
  },
] as const;

export function editorialAspectRatio(width: number, height: number): string {
  return `${width} / ${height}`;
}
