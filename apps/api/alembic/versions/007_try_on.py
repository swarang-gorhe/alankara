"""try-on: product calibration columns, requests, events

Revision ID: 007_try_on
Revises: 006_commerce_platform
Create Date: 2026-08-24

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "007_try_on"
down_revision: str | None = "006_commerce_platform"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("try_on_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column("products", sa.Column("try_on_asset_url", sa.Text(), nullable=True))
    op.add_column(
        "products",
        sa.Column("try_on_scale", sa.Numeric(10, 4), nullable=False, server_default="1.0"),
    )
    op.add_column(
        "products",
        sa.Column("try_on_left_offset_x", sa.Numeric(10, 4), nullable=False, server_default="0"),
    )
    op.add_column(
        "products",
        sa.Column("try_on_left_offset_y", sa.Numeric(10, 4), nullable=False, server_default="0"),
    )
    op.add_column(
        "products",
        sa.Column("try_on_right_offset_x", sa.Numeric(10, 4), nullable=False, server_default="0"),
    )
    op.add_column(
        "products",
        sa.Column("try_on_right_offset_y", sa.Numeric(10, 4), nullable=False, server_default="0"),
    )
    op.add_column(
        "products",
        sa.Column("try_on_rotation", sa.Numeric(10, 4), nullable=False, server_default="0"),
    )
    op.add_column(
        "products",
        sa.Column("try_on_vertical_offset", sa.Numeric(10, 4), nullable=False, server_default="0"),
    )

    op.create_table(
        "try_on_requests",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("customer_id", sa.String(length=64), nullable=True),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("photo_url", sa.Text(), nullable=True),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("instagram_handle", sa.Text(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("customization_request", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="new"),
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
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.CheckConstraint(
            "status IN ('new','contacted','customization_discussion','confirmed','order_created','cancelled')",
            name="ck_try_on_requests_status",
        ),
    )
    op.create_index("ix_try_on_requests_customer_id", "try_on_requests", ["customer_id"])
    op.create_index("ix_try_on_requests_product_id", "try_on_requests", ["product_id"])
    op.create_index("ix_try_on_requests_status", "try_on_requests", ["status"])
    op.create_index("ix_try_on_requests_created_at", "try_on_requests", ["created_at"])

    op.create_table(
        "try_on_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("session_id", sa.String(length=128), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=True),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
        sa.CheckConstraint(
            "event_type IN ("
            "'open','camera_start','photo_upload','try_on_success','product_change',"
            "'share','order_click','order_completed')",
            name="ck_try_on_events_event_type",
        ),
    )
    op.create_index("ix_try_on_events_session_id", "try_on_events", ["session_id"])
    op.create_index("ix_try_on_events_product_id", "try_on_events", ["product_id"])
    op.create_index("ix_try_on_events_event_type", "try_on_events", ["event_type"])
    op.create_index("ix_try_on_events_created_at", "try_on_events", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_try_on_events_created_at", table_name="try_on_events")
    op.drop_index("ix_try_on_events_event_type", table_name="try_on_events")
    op.drop_index("ix_try_on_events_product_id", table_name="try_on_events")
    op.drop_index("ix_try_on_events_session_id", table_name="try_on_events")
    op.drop_table("try_on_events")

    op.drop_index("ix_try_on_requests_created_at", table_name="try_on_requests")
    op.drop_index("ix_try_on_requests_status", table_name="try_on_requests")
    op.drop_index("ix_try_on_requests_product_id", table_name="try_on_requests")
    op.drop_index("ix_try_on_requests_customer_id", table_name="try_on_requests")
    op.drop_table("try_on_requests")

    op.drop_column("products", "try_on_vertical_offset")
    op.drop_column("products", "try_on_rotation")
    op.drop_column("products", "try_on_right_offset_y")
    op.drop_column("products", "try_on_right_offset_x")
    op.drop_column("products", "try_on_left_offset_y")
    op.drop_column("products", "try_on_left_offset_x")
    op.drop_column("products", "try_on_scale")
    op.drop_column("products", "try_on_asset_url")
    op.drop_column("products", "try_on_enabled")
