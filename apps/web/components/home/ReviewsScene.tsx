"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const reviews = [
  {
    id: 1,
    author: "Priya M.",
    product: "Temple Pearl Strand",
    rating: 5,
    text: "The craftsmanship is extraordinary. It felt like wearing a piece of art passed down through generations.",
  },
  {
    id: 2,
    author: "Ananya K.",
    product: "Festive Jhumka Set",
    rating: 5,
    text: "Every detail — from the clasp to the embroidery — speaks of patience and love. My mother wept when she saw it.",
  },
  {
    id: 3,
    author: "Rhea S.",
    product: "Everyday Lotus Pendant",
    rating: 5,
    text: "Understated luxury. I reach for it every morning. It has become part of my story.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotate: -1 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function ReviewsScene() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative px-6 py-24 md:py-32" aria-label="Customer reviews">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Kind words</p>
          <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
            Stories from our circle
          </h2>
        </div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
        >
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              variants={cardVariants}
              className={cn(
                "paper-card relative rounded-sm border border-gold/15 bg-cream-light p-8 shadow-sm",
                index === 1 && "md:-mt-4",
              )}
              style={{
                transform: `rotate(${index === 0 ? -0.5 : index === 2 ? 0.5 : 0}deg)`,
              }}
            >
              <div className="mb-4 flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-gold-bright" aria-hidden="true">
                    &#9733;
                  </span>
                ))}
              </div>
              <blockquote className="font-script text-lg italic leading-relaxed text-maroon/90">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <footer className="mt-6 border-t border-gold/10 pt-4">
                <p className="text-sm font-medium text-charcoal">{review.author}</p>
                <p className="text-xs text-charcoal-muted">{review.product}</p>
              </footer>
              <div
                className="pointer-events-none absolute right-4 top-4 h-12 w-12 opacity-[0.04]"
                style={{
                  backgroundImage: "url(/brand/logo.svg)",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" data-magnetic asChild>
            <Link href="/reviews" data-cursor-sparkle>
              Read all reviews
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
