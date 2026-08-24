"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchAdminCustomers, fetchCustomerEvents } from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<
    Array<{ email: string; orderCount: number; totalSpent: number; lastOrderAt: string | null }>
  >([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<
    Array<{ id: string; productName?: string; eventType: string; createdAt: string }>
  >([]);

  useEffect(() => {
    fetchAdminCustomers().then(setCustomers);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchCustomerEvents(selected).then(setEvents).catch(() => setEvents([]));
  }, [selected]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-admin-text">Customers</h1>
      <p className="text-sm text-admin-muted">Order history, lifetime value, and atelier event log</p>
      <AdminTable columns={["Email", "Orders", "Lifetime value", "Last order", ""]}>
        {customers.map((c) => (
          <AdminTableRow key={c.email}>
            <AdminTableCell>{c.email}</AdminTableCell>
            <AdminTableCell className="font-mono">{c.orderCount}</AdminTableCell>
            <AdminTableCell className="font-mono">{formatPrice(c.totalSpent)}</AdminTableCell>
            <AdminTableCell className="text-xs text-admin-muted">
              {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}
            </AdminTableCell>
            <AdminTableCell>
              <button
                type="button"
                onClick={() => setSelected(c.email)}
                className="text-xs uppercase tracking-widest text-admin-accent"
              >
                Events
              </button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>

      {selected && (
        <section>
          <h2 className="font-display text-xl text-admin-text">Event history · {selected}</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-admin-muted">No behavioural events recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {events.map((event) => (
                <li key={event.id} className="flex justify-between border-b border-admin-border py-2">
                  <span>
                    <span className="font-mono uppercase">{event.eventType}</span>{" "}
                    {event.productName ?? event.id}
                  </span>
                  <span className="text-admin-muted">{new Date(event.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
