import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Write to the Alankara atelier — call +91 70207 57445, email thealankarastudios@gmail.com, or Instagram @alankara.studios.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactForm />;
}
