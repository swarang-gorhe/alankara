import {
  BRAND_CONTACT_BLURB,
  BRAND_EMAIL,
  BRAND_INSTAGRAM_HANDLE,
  BRAND_INSTAGRAM_URL,
  BRAND_PHONE_DISPLAY,
  BRAND_PHONE_TEL,
} from "@/lib/brand/contact";

export type LocalFaqEntry = {
  id: string;
  keywords: string[];
  answer: string;
};

export const LOCAL_FAQ: LocalFaqEntry[] = [
  {
    id: "lightweight",
    keywords: ["lightweight", "light weight", "heavy", "comfort", "all day"],
    answer:
      "Our cloth earrings are cut and backed to stay light on the lobe — designed for all-day wear. Look for “Smaller” sizes if you prefer the lightest feel, or “Bigger” for a statement that still stays comfortable.",
  },
  {
    id: "customize",
    keywords: ["custom", "customise", "customize", "colour", "color", "bespoke"],
    answer: `Yes — we love custom colour and small design notes. Tell us the pair you like and what you’d change. ${BRAND_CONTACT_BLURB}`,
  },
  {
    id: "care",
    keywords: ["care", "clean", "wash", "store", "perfume"],
    answer:
      "Store each pair in the cotton pouch. Avoid spraying perfume directly on the fabric, and spot-clean gently if needed. Keep away from heavy water and moisture so the textile keeps its shape.",
  },
  {
    id: "delivery",
    keywords: ["deliver", "shipping", "dispatch", "how long", "when will", "courier"],
    answer: `We finish in small batches. Most orders leave the atelier within a few working days; courier timing depends on your city. For a specific dispatch date, write to ${BRAND_EMAIL} or call ${BRAND_PHONE_DISPLAY}.`,
  },
  {
    id: "fabric",
    keywords: ["fabric", "choose", "material", "cotton", "silk", "textile", "which"],
    answer:
      "Start with the occasion and the colour you already wear. Cotton pieces are everyday-friendly; richer weaves and zari accents suit festive looks. On each product page you’ll see materials, size (Bigger ₹160 / Smaller ₹130), and care notes to help you choose.",
  },
  {
    id: "price",
    keywords: ["price", "cost", "₹", "rupee", "how much"],
    answer:
      "Bigger earrings are ₹160 and Smaller earrings are ₹130. Custom colour or design notes may carry a small atelier fee — we’ll confirm before you pay.",
  },
  {
    id: "contact",
    keywords: ["contact", "phone", "email", "whatsapp", "instagram", "call", "reach"],
    answer: `${BRAND_CONTACT_BLURB} We’re happiest answering little-moment questions there.`,
  },
  {
    id: "try-on",
    keywords: ["try on", "try-on", "virtual", "see it on", "camera"],
    answer:
      "You can try earrings on virtually from product pages with “Try It On” — live camera or a photo, all on your device. Photos are only shared with us if you choose “Share My Look.”",
  },
];

const DEFAULT_ANSWER = `Thank you for writing. I’m the Alankara atelier guide for fabric jewellery questions — care, sizing, custom colour, and shipping. ${BRAND_CONTACT_BLURB}`;

export function matchLocalFaq(message: string): { answer: string; matchedId: string | null } {
  const lower = message.toLowerCase();
  for (const entry of LOCAL_FAQ) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { answer: entry.answer, matchedId: entry.id };
    }
  }
  return { answer: DEFAULT_ANSWER, matchedId: null };
}

export {
  BRAND_EMAIL,
  BRAND_INSTAGRAM_HANDLE,
  BRAND_INSTAGRAM_URL,
  BRAND_PHONE_DISPLAY,
  BRAND_PHONE_TEL,
  BRAND_CONTACT_BLURB,
};
