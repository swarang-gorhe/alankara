"""necklace try-on: type + necklace calibration columns

Revision ID: 008_necklace_try_on
Revises: 007_try_on
Create Date: 2026-08-25

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "008_necklace_try_on"
down_revision: str | None = "007_try_on"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "try_on_type",
            sa.String(length=32),
            nullable=False,
            server_default="earring",
        ),
    )
    op.add_column(
        "products",
        sa.Column("try_on_necklace_asset_url", sa.Text(), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column(
            "try_on_necklace_length_offset",
            sa.Numeric(10, 4),
            nullable=False,
            server_default="0",
        ),
    )
    op.add_column(
        "products",
        sa.Column(
            "try_on_necklace_scale",
            sa.Numeric(10, 4),
            nullable=False,
            server_default="1.0",
        ),
    )
    op.add_column(
        "products",
        sa.Column(
            "try_on_necklace_rotation_offset",
            sa.Numeric(10, 4),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade() -> None:
    op.drop_column("products", "try_on_necklace_rotation_offset")
    op.drop_column("products", "try_on_necklace_scale")
    op.drop_column("products", "try_on_necklace_length_offset")
    op.drop_column("products", "try_on_necklace_asset_url")
    op.drop_column("products", "try_on_type")
