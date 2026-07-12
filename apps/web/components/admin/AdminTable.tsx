import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminTableProps = {
  columns: string[];
  children: ReactNode;
  className?: string;
};

export function AdminTable({ columns, children, className }: AdminTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-admin-border bg-admin-surface", className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-elevated/50">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-admin-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTableRow({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-admin-elevated/30 transition-colors">{children}</tr>;
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 text-admin-text", className)}>{children}</td>;
}
