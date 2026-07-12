"""cart and checkout schema

Revision ID: 002_cart_checkout
Revises: 001_initial
Create Date: 2026-07-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "002_cart_checkout"
down_revision: str | None = "001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "carts",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("user_id", sa.String(length=64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_carts_session_id"), "carts", ["session_id"], unique=False)
    op.create_index(op.f("ix_carts_user_id"), "carts", ["user_id"], unique=False)

    op.create_table(
        "cart_items",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("cart_id", sa.String(length=64), nullable=False),
        sa.Column("product_variant_id", sa.String(length=64), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_variant_id"], ["product_variants.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("cart_id", "product_variant_id", name="uq_cart_variant"),
    )
    op.create_index(op.f("ix_cart_items_cart_id"), "cart_items", ["cart_id"], unique=False)

    op.create_table(
        "addresses",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("line1", sa.String(length=255), nullable=False),
        sa.Column("line2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=128), nullable=False),
        sa.Column("state", sa.String(length=128), nullable=False),
        sa.Column("postal_code", sa.String(length=32), nullable=False),
        sa.Column("country", sa.String(length=8), nullable=False, server_default="IN"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_addresses_user_id"), "addresses", ["user_id"], unique=False)

    op.create_table(
        "orders",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=True),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("subtotal_amount", sa.Integer(), nullable=False),
        sa.Column("total_amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False, server_default="INR"),
        sa.Column(
            "shipping_address",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_orders_status"), "orders", ["status"], unique=False)
    op.create_index(op.f("ix_orders_user_id"), "orders", ["user_id"], unique=False)

    op.create_table(
        "order_items",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("order_id", sa.String(length=64), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("variant_id", sa.String(length=64), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("variant_label", sa.String(length=255), nullable=True),
        sa.Column("sku", sa.String(length=64), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_amount", sa.Integer(), nullable=False),
        sa.Column("unit_price_currency", sa.String(length=8), nullable=False),
        sa.Column("line_total_amount", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_order_items_order_id"), "order_items", ["order_id"], unique=False)


def downgrade() -> None:
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("addresses")
    op.drop_table("cart_items")
    op.drop_table("carts")
