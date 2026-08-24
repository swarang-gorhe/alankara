"""commerce platform: product status, reviews, payments, events, settings

Revision ID: 006_commerce_platform
Revises: 005_collections_media
Create Date: 2026-08-24

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "006_commerce_platform"
down_revision: str | None = "005_collections_media"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("status", sa.String(length=32), nullable=False, server_default="published"),
    )
    op.add_column(
        "products",
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("ai_generated_tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f("ix_products_status"), "products", ["status"], unique=False)
    op.execute("UPDATE products SET created_at = NOW() WHERE created_at IS NULL")
    op.execute("UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL")
    op.alter_column("products", "created_at", nullable=False)
    op.alter_column("products", "updated_at", nullable=False)

    op.add_column("reviews", sa.Column("title", sa.String(length=255), nullable=True))
    op.add_column("reviews", sa.Column("customer_email", sa.String(length=255), nullable=True))
    op.add_column(
        "reviews",
        sa.Column(
            "verified_purchase",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "reviews",
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
    )
    op.create_index(op.f("ix_reviews_status"), "reviews", ["status"], unique=False)
    op.execute("UPDATE reviews SET status = 'approved' WHERE approved IS TRUE")
    op.execute("UPDATE reviews SET status = 'pending' WHERE approved IS FALSE")

    op.add_column(
        "orders",
        sa.Column("payment_status", sa.String(length=32), nullable=False, server_default="pending"),
    )
    op.add_column("orders", sa.Column("payment_intent_id", sa.String(length=128), nullable=True))
    op.add_column(
        "orders",
        sa.Column("shipping_amount", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index(op.f("ix_orders_payment_status"), "orders", ["payment_status"], unique=False)
    op.create_index(
        op.f("ix_orders_payment_intent_id"),
        "orders",
        ["payment_intent_id"],
        unique=False,
    )
    op.execute(
        "UPDATE orders SET payment_status = 'paid' "
        "WHERE status IN ('paid', 'processing', 'shipped', 'delivered')"
    )

    op.create_table(
        "customer_events",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("customer_id", sa.String(length=64), nullable=True),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("event_type", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_customer_events_customer_id"), "customer_events", ["customer_id"])
    op.create_index(op.f("ix_customer_events_session_id"), "customer_events", ["session_id"])
    op.create_index(op.f("ix_customer_events_product_id"), "customer_events", ["product_id"])
    op.create_index(op.f("ix_customer_events_event_type"), "customer_events", ["event_type"])
    op.create_index(op.f("ix_customer_events_created_at"), "customer_events", ["created_at"])

    op.execute(
        """
        INSERT INTO settings (key, value, updated_at) VALUES
          ('low_stock_threshold', '5', NOW()),
          ('currency', '"INR"', NOW()),
          ('tax_rate_bps', '0', NOW())
        ON CONFLICT (key) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_customer_events_created_at"), table_name="customer_events")
    op.drop_index(op.f("ix_customer_events_event_type"), table_name="customer_events")
    op.drop_index(op.f("ix_customer_events_product_id"), table_name="customer_events")
    op.drop_index(op.f("ix_customer_events_session_id"), table_name="customer_events")
    op.drop_index(op.f("ix_customer_events_customer_id"), table_name="customer_events")
    op.drop_table("customer_events")

    op.drop_index(op.f("ix_orders_payment_intent_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_payment_status"), table_name="orders")
    op.drop_column("orders", "shipping_amount")
    op.drop_column("orders", "payment_intent_id")
    op.drop_column("orders", "payment_status")

    op.drop_index(op.f("ix_reviews_status"), table_name="reviews")
    op.drop_column("reviews", "status")
    op.drop_column("reviews", "verified_purchase")
    op.drop_column("reviews", "customer_email")
    op.drop_column("reviews", "title")

    op.drop_index(op.f("ix_products_status"), table_name="products")
    op.drop_column("products", "updated_at")
    op.drop_column("products", "created_at")
    op.drop_column("products", "ai_generated_tags")
    op.drop_column("products", "tags")
    op.drop_column("products", "status")
