"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminTableProps = {
  columns: string[];
  children: ReactNode;
  className?: string;
};

export function AdminTable({ columns, children, className }: AdminTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-sm border border-gold/25 bg-cream-light", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gold/20 bg-cream/60">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-charcoal-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gold/10">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-cream/50", className)}>{children}</tr>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle text-charcoal", className)}>{children}</td>;
}
