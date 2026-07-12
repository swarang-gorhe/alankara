"""admin discounts and faq schema

Revision ID: 003_admin_discounts_faq
Revises: 002_cart_checkout
Create Date: 2026-07-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "003_admin_discounts_faq"
down_revision: str | None = "002_cart_checkout"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "discounts",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("type", sa.String(length=16), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.Column("conditions", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("usage_limit", sa.Integer(), nullable=True),
        sa.Column("usage_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
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
        sa.UniqueConstraint("code"),
    )
    op.create_index(op.f("ix_discounts_code"), "discounts", ["code"], unique=False)

    op.create_table(
        "faq_entries",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False, server_default="general"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
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
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_faq_entries_category"), "faq_entries", ["category"], unique=False)
    op.create_index(op.f("ix_faq_entries_slug"), "faq_entries", ["slug"], unique=False)

    op.add_column("orders", sa.Column("discount_code", sa.String(length=64), nullable=True))
    op.add_column(
        "orders",
        sa.Column("discount_amount", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("orders", sa.Column("fulfillment_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "fulfillment_notes")
    op.drop_column("orders", "discount_amount")
    op.drop_column("orders", "discount_code")
    op.drop_table("faq_entries")
    op.drop_table("discounts")
