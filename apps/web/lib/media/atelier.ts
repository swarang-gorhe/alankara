import type { MediaAsset } from "./catalog";

/** Commercial process & hero stills for fabric jewellery (not embroidery). */
export const ATELIER_MEDIA = {
  heroEarrings: {
    id: "hero-earrings",
    src: "/media/hero/cloth-earrings.jpg",
    alt: "Handmade mustard and burgundy cloth earrings on ivory linen",
    width: 1024,
    height: 1024,
    role: "product" as const,
  },
  floralEarrings: {
    id: "floral-earrings",
    src: "/media/hero/floral-earrings.jpg",
    alt: "Handmade fabric floral earrings with pearl accents",
    width: 1024,
    height: 1024,
    role: "product" as const,
  },
  selectFabric: {
    id: "select-fabric",
    src: "/media/process/select-fabric.jpg",
    alt: "Hands selecting cotton fabric swatches for cloth jewellery",
    width: 1536,
    height: 1024,
    role: "lifestyle" as const,
  },
  shapeFabric: {
    id: "shape-fabric",
    src: "/media/process/shape-fabric.jpg",
    alt: "Scissors cutting patterned cotton into jewellery shapes",
    width: 1536,
    height: 1024,
    role: "lifestyle" as const,
  },
  addDetails: {
    id: "add-details",
    src: "/media/process/add-details.jpg",
    alt: "Pearls, beads, ghungroos and earring hooks for fabric jewellery",
    width: 1536,
    height: 1024,
    role: "detail" as const,
  },
  assemble: {
    id: "assemble",
    src: "/media/process/assemble.jpg",
    alt: "Hands assembling a cloth earring with hook and beads",
    width: 1536,
    height: 1024,
    role: "lifestyle" as const,
  },
  customize: {
    id: "customize",
    src: "/media/customize/fabric-shapes.jpg",
    alt: "Fabric swatches beside round, floral and drop cloth earring shapes",
    width: 1536,
    height: 1024,
    role: "lifestyle" as const,
  },
} satisfies Record<string, MediaAsset>;

export const MAKE_STEPS = [
  {
    id: "01",
    title: "Select the Fabric",
    body: "Cotton, prints, texture — chosen for colour and how it will sit on the ear.",
    image: ATELIER_MEDIA.selectFabric,
  },
  {
    id: "02",
    title: "Shape It",
    body: "Measured, cut, folded and layered into circles, petals and drops.",
    image: ATELIER_MEDIA.shapeFabric,
  },
  {
    id: "03",
    title: "Add the Details",
    body: "Pearls, beads, ghungroos, thread and gold-tone findings.",
    image: ATELIER_MEDIA.addDetails,
  },
  {
    id: "04",
    title: "Put It Together",
    body: "Fabric, hooks and accents assembled by hand into a balanced pair.",
    image: ATELIER_MEDIA.assemble,
  },
  {
    id: "05",
    title: "Made for You",
    body: "Handmade, lightweight, customizable — finished with care.",
    image: ATELIER_MEDIA.heroEarrings,
  },
] as const;

export const COLLECTION_TILES = [
  {
    slug: "cloth-earrings",
    label: "Earrings",
    href: "/shop?category=cloth-earrings",
    image: ATELIER_MEDIA.heroEarrings,
  },
  {
    slug: "fabric-necklaces",
    label: "Necklaces",
    href: "/shop?category=fabric-necklaces",
    image: ATELIER_MEDIA.selectFabric,
  },
  {
    slug: "fabric-bracelets",
    label: "Bracelets",
    href: "/shop?category=fabric-bracelets",
    image: ATELIER_MEDIA.addDetails,
  },
  {
    slug: "jewellery-sets",
    label: "Sets",
    href: "/shop?category=jewellery-sets",
    image: ATELIER_MEDIA.floralEarrings,
  },
  {
    slug: "customize",
    label: "Customize",
    href: "/customize",
    image: ATELIER_MEDIA.customize,
  },
] as const;
