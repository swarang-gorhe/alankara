"""collections, media, settings, wishlist

Revision ID: 005_collections_media
Revises: 004_admin_ai_logs
Create Date: 2026-07-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "005_collections_media"
down_revision: str | None = "004_admin_ai_logs"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "collections",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=512), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_collections_slug"), "collections", ["slug"], unique=False)

    op.create_table(
        "collection_products",
        sa.Column("collection_id", sa.String(length=64), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["collection_id"], ["collections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("collection_id", "product_id"),
    )

    op.create_table(
        "media",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("url", sa.String(length=1024), nullable=False),
        sa.Column("alt_text", sa.String(length=512), nullable=True),
        sa.Column("mime_type", sa.String(length=128), nullable=True),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("product_id", sa.String(length=64), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_media_product_id"), "media", ["product_id"], unique=False)

    op.create_table(
        "settings",
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("value", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )

    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("variant_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", "variant_id", name="uq_wishlist_user_product"),
    )
    op.create_index(op.f("ix_wishlist_items_user_id"), "wishlist_items", ["user_id"], unique=False)

    # Seed default collections for cloth/fabric jewellery
    op.execute(
        """
        INSERT INTO collections (id, slug, name, description, featured, published, sort_order, created_at, updated_at)
        VALUES
          ('col-festive-textiles', 'festive-textiles', 'Festive Textiles',
           'Coordinated fabric jewellery for celebrations — mirror work, brocade, and zari.', true, true, 1, NOW(), NOW()),
          ('col-everyday-fabric', 'everyday-fabric', 'Everyday Fabric',
           'Lightweight cloth earrings, rings, and cuffs for daily wear.', false, true, 2, NOW(), NOW()),
          ('col-sustainable-edit', 'sustainable-edit', 'Sustainable Edit',
           'Upcycled and zero-waste textile accessories.', false, true, 3, NOW(), NOW())
        ON CONFLICT DO NOTHING
        """
    )

    op.execute(
        """
        INSERT INTO settings (key, value, updated_at)
        VALUES
          ('store.name', '"Alankara"', NOW()),
          ('store.tagline', '"Crafted for little moments"', NOW()),
          ('store.currency', '"INR"', NOW()),
          ('store.low_stock_threshold', '5', NOW())
        ON CONFLICT DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_table("wishlist_items")
    op.drop_table("settings")
    op.drop_table("media")
    op.drop_table("collection_products")
    op.drop_table("collections")
