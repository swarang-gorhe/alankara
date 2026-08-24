"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { consoleBase } from "@/lib/admin/paths";
import { fetchTryOnRequests, type AdminTryOnRequest } from "@/lib/api/admin";

export default function TryOnRequestsPage() {
  const pathname = usePathname();
  const base = consoleBase(pathname);
  const [items, setItems] = useState<AdminTryOnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchTryOnRequests()
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-admin-text">Try-On Requests</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Shared looks, customization notes, and follow-up status.
        </p>
      </div>

      {loading ? (
        <p className="text-admin-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-admin-muted">No try-on shares yet.</p>
      ) : (
        <AdminTable columns={["Customer", "Product", "Status", "Date", ""]}>
          {items.map((row) => (
            <AdminTableRow key={row.id}>
              <AdminTableCell>
                <div className="font-medium">{row.name || "Guest"}</div>
                <div className="text-xs text-admin-muted">{row.email || row.phone || "—"}</div>
              </AdminTableCell>
              <AdminTableCell className="text-sm">{row.productName}</AdminTableCell>
              <AdminTableCell className="font-mono text-xs uppercase">{row.status}</AdminTableCell>
              <AdminTableCell className="text-xs text-admin-muted">
                {row.createdAt.slice(0, 10)}
              </AdminTableCell>
              <AdminTableCell>
                <Link
                  href={`${base}/try-on-requests/${row.id}`}
                  className="text-xs uppercase tracking-widest text-admin-accent hover:underline"
                >
                  Open
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
