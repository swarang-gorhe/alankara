"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchAdminOrders, updateAdminOrder, type AdminOrder } from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

const STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => {
    fetchAdminOrders().then((data) => setOrders(data.items));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateAdminOrder(orderId, { status });
    load();
  };

  const handleSaveNotes = async (orderId: string) => {
    await updateAdminOrder(orderId, { fulfillmentNotes: notes[orderId] ?? "" });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-maroon">Orders</h1>
        <p className="mt-1 text-sm text-charcoal-muted">Status updates and fulfillment notes</p>
      </div>

      <AdminTable columns={["Order", "Customer", "Total", "Status", "Date", ""]}>
        {orders.map((order) => (
          <AdminTableRow key={order.id}>
            <AdminTableCell className="font-mono text-xs">{order.id}</AdminTableCell>
            <AdminTableCell>{order.email}</AdminTableCell>
            <AdminTableCell>{formatPrice(order.total.amount)}</AdminTableCell>
            <AdminTableCell>
              <select
                value={order.status}
                onChange={(e) => void handleStatusChange(order.id, e.target.value)}
                className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </AdminTableCell>
            <AdminTableCell className="text-xs text-charcoal-muted">
              {new Date(order.createdAt).toLocaleDateString()}
            </AdminTableCell>
            <AdminTableCell>
              <button
                type="button"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="text-xs uppercase tracking-widest text-gold hover:underline"
              >
                {expanded === order.id ? "Hide" : "Details"}
              </button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>

      {expanded && (
        <div className="rounded-sm border border-gold/25 bg-cream-light p-5">
          {(() => {
            const order = orders.find((o) => o.id === expanded);
            if (!order) return null;
            return (
              <div className="space-y-4">
                <h3 className="font-display text-lg text-maroon">Order {order.id}</h3>
                <ul className="space-y-2 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.lineTotal.amount)}</span>
                    </li>
                  ))}
                </ul>
                {order.discountCode && (
                  <p className="text-sm text-charcoal-muted">
                    Discount {order.discountCode}: −{formatPrice(order.discountAmount.amount)}
                  </p>
                )}
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-charcoal-muted">
                    Fulfillment notes
                  </span>
                  <textarea
                    value={notes[order.id] ?? order.fulfillmentNotes ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [order.id]: e.target.value }))}
                    className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
                    rows={3}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleSaveNotes(order.id)}
                  className="text-xs uppercase tracking-widest text-maroon hover:underline"
                >
                  Save notes
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
