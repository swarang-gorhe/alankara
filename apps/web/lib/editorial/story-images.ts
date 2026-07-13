export type StoryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Masonry grid placement */
  span: string;
};

/** Editorial studio frames — natural crops, hands excluded where possible */
export const STORY_IMAGES: StoryImage[] = [
  {
    id: "embroidery",
    src: "/editorial/embroidery-hoop.webp",
    alt: "Embroidery hoop with layered fabric flowers and pearl centres",
    caption: "Embroidery in progress",
    width: 681,
    height: 210,
    span: "col-span-2 row-span-2",
  },
  {
    id: "pearls",
    src: "/editorial/pearl-threading.webp",
    alt: "Freshwater pearls threaded on silk cord beside a ceramic bowl",
    caption: "Pearl threading",
    width: 336,
    height: 187,
    span: "col-span-1 row-span-1",
  },
  {
    id: "pouch",
    src: "/editorial/cotton-pouch.webp",
    alt: "Alankara cotton drawstring pouch in a kraft gift box with dried florals",
    caption: "Cotton pouch unboxing",
    width: 337,
    height: 372,
    span: "col-span-1 row-span-2",
  },
  {
    id: "studio",
    src: "/editorial/studio-morning.webp",
    alt: "Morning light across a linen-covered studio table with scissors and thread",
    caption: "Studio morning",
    width: 336,
    height: 197,
    span: "col-span-1 row-span-1",
  },
  {
    id: "ghungroo",
    src: "/editorial/ghungroo-detail.webp",
    alt: "Maroon fabric beads with gold embroidery and tiny ghungroo bells",
    caption: "Ghungroo details",
    width: 337,
    height: 190,
    span: "col-span-1 row-span-1",
  },
  {
    id: "stitch",
    src: "/editorial/stitch-detail.webp",
    alt: "Layered fabric flower with pink and sage thread spools",
    caption: "Hand-stitching the details",
    width: 681,
    height: 154,
    span: "col-span-2 row-span-1 md:col-span-1",
  },
];

export const PROCESS_STEPS = [
  {
    id: "thread",
    title: "Thread selection",
    description:
      "Cotton, silk, and zari threads are chosen for weight, drape, and how they catch afternoon light.",
    image: "/editorial/pearl-threading.webp",
    alt: "Pearls and thread on linen",
    width: 336,
    height: 187,
  },
  {
    id: "embroidery",
    title: "Embroidery",
    description:
      "Motifs are sketched on butter paper, then stitched frame by frame — running stitch, satin, and French knots.",
    image: "/editorial/embroidery-hoop.webp",
    alt: "Embroidery hoop with fabric flowers",
    width: 681,
    height: 210,
  },
  {
    id: "pearls",
    title: "Pearl & ghungroo",
    description:
      "Freshwater pearls and tiny ghungroos are knotted so each strand moves softly with you.",
    image: "/editorial/ghungroo-detail.webp",
    alt: "Ghungroo bells on embroidered fabric beads",
    width: 337,
    height: 190,
  },
  {
    id: "finish",
    title: "Packaging",
    description:
      "Every piece is tissue-wrapped and nestled in a reusable cotton pouch — sealed with our medallion mark.",
    image: "/editorial/cotton-pouch.webp",
    alt: "Cotton pouch in gift packaging",
    width: 337,
    height: 372,
  },
] as const;

export function editorialAspectRatio(width: number, height: number): string {
  return `${width} / ${height}`;
}
