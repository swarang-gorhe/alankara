"""admin ai logs table

Revision ID: 004_admin_ai_logs
Revises: 003_admin_discounts_faq
Create Date: 2026-07-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "004_admin_ai_logs"
down_revision: str | None = "003_admin_discounts_faq"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "admin_ai_logs",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("agent_type", sa.String(length=64), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("tools_called", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("result", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_admin_ai_logs_agent_type"),
        "admin_ai_logs",
        ["agent_type"],
        unique=False,
    )
    op.create_index(op.f("ix_admin_ai_logs_user_id"), "admin_ai_logs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_admin_ai_logs_user_id"), table_name="admin_ai_logs")
    op.drop_index(op.f("ix_admin_ai_logs_agent_type"), table_name="admin_ai_logs")
    op.drop_table("admin_ai_logs")
