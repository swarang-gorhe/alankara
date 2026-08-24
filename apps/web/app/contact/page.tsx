import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Write to the Alankara atelier — custom colour, shipping, care, and little moments.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactForm />;
}
