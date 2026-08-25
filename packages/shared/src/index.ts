/** Shared TypeScript types for Alankara monorepo */

export type Money = {
  amount: number;
  currency: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: Money;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  images: string[];
  variants: ProductVariant[];
  materials?: string[];
  careInstructions?: string;
  featured?: boolean;
  status?: "draft" | "published" | "archived";
  tags?: string[];
  aiGeneratedTags?: string[];
  averageRating?: number | null;
  reviewCount?: number;
  tryOnEnabled?: boolean;
  tryOnType?: "earring" | "necklace";
  /** @deprecated Prefer tryOnType — kept for fixture compatibility */
  tryOnKind?: "earring" | "necklace";
  tryOnAssetUrl?: string | null;
  tryOnScale?: number;
  tryOnLeftOffsetX?: number;
  tryOnLeftOffsetY?: number;
  tryOnRightOffsetX?: number;
  tryOnRightOffsetY?: number;
  tryOnRotation?: number;
  tryOnVerticalOffset?: number;
  tryOnNecklaceAssetUrl?: string | null;
  tryOnNecklaceLengthOffset?: number;
  tryOnNecklaceScale?: number;
  tryOnNecklaceRotationOffset?: number;
};

export type TryOnConfig = {
  productId: string;
  productName: string;
  tryOnEnabled: boolean;
  tryOnType: "earring" | "necklace";
  tryOnAssetUrl?: string | null;
  tryOnScale: number;
  tryOnLeftOffsetX: number;
  tryOnLeftOffsetY: number;
  tryOnRightOffsetX: number;
  tryOnRightOffsetY: number;
  tryOnRotation: number;
  tryOnVerticalOffset: number;
  tryOnNecklaceAssetUrl?: string | null;
  tryOnNecklaceLengthOffset: number;
  tryOnNecklaceScale: number;
  tryOnNecklaceRotationOffset: number;
};

export type Review = {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  rating: number;
  title?: string;
  text: string;
  createdAt: string;
  approved: boolean;
  verifiedPurchase?: boolean;
  status?: "pending" | "approved" | "rejected";
};

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  updatedAt: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  total: Money;
  createdAt: string;
};

export type HealthResponse = {
  status: "ok" | "degraded" | "error";
  environment: string;
  version: string;
};
