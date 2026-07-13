export type StoryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  /** Masonry grid placement */
  span: string;
  aspect?: string;
};

/** Editorial studio frames — cropped from mood board, hands excluded */
export const STORY_IMAGES: StoryImage[] = [
  {
    id: "embroidery",
    src: "/editorial/embroidery-hoop.webp",
    alt: "Embroidery hoop with layered fabric flowers and pearl centres",
    caption: "Embroidery in progress",
    span: "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
    aspect: "aspect-[4/3] md:aspect-auto md:min-h-[320px]",
  },
  {
    id: "pearls",
    src: "/editorial/pearl-threading.webp",
    alt: "Freshwater pearls threaded on silk cord beside a ceramic bowl",
    caption: "Pearl threading",
    span: "col-span-1 row-span-1",
    aspect: "aspect-square",
  },
  {
    id: "pouch",
    src: "/editorial/cotton-pouch.webp",
    alt: "Alankara cotton drawstring pouch in a kraft gift box with dried florals",
    caption: "Cotton pouch unboxing",
    span: "col-span-1 row-span-2 md:row-span-2",
    aspect: "aspect-[3/4] md:aspect-auto md:min-h-[280px]",
  },
  {
    id: "studio",
    src: "/editorial/studio-morning.webp",
    alt: "Morning light across a linen-covered studio table with scissors and thread",
    caption: "Studio morning",
    span: "col-span-1 row-span-1",
    aspect: "aspect-square",
  },
  {
    id: "ghungroo",
    src: "/editorial/ghungroo-detail.webp",
    alt: "Maroon fabric beads with gold embroidery and tiny ghungroo bells",
    caption: "Ghungroo details",
    span: "col-span-2 row-span-1 md:col-span-1",
    aspect: "aspect-[2/1] md:aspect-square",
  },
  {
    id: "stitch",
    src: "/editorial/stitch-detail.webp",
    alt: "Layered fabric flower with pink and sage thread spools",
    caption: "Stitch by stitch",
    span: "col-span-1 row-span-1",
    aspect: "aspect-square",
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
  },
  {
    id: "embroidery",
    title: "Embroidery",
    description:
      "Motifs are sketched on butter paper, then stitched frame by frame — running stitch, satin, and French knots.",
    image: "/editorial/embroidery-hoop.webp",
    alt: "Embroidery hoop with fabric flowers",
  },
  {
    id: "pearls",
    title: "Pearl & ghungroo",
    description:
      "Freshwater pearls and tiny ghungroos are knotted so each strand moves softly with you.",
    image: "/editorial/ghungroo-detail.webp",
    alt: "Ghungroo bells on embroidered fabric beads",
  },
  {
    id: "finish",
    title: "Packaging",
    description:
      "Every piece is tissue-wrapped and nestled in a reusable cotton pouch — sealed with our medallion mark.",
    image: "/editorial/cotton-pouch.webp",
    alt: "Cotton pouch in gift packaging",
  },
] as const;
