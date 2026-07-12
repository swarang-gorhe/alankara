"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  createAdminDiscount,
  deleteAdminDiscount,
  fetchAdminDiscounts,
  type AdminDiscount,
} from "@/lib/api/admin";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: 10,
  });

  const load = () => {
    fetchAdminDiscounts().then((data) => setDiscounts(data.items));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createAdminDiscount({
      code: form.code,
      type: form.type,
      value: Number(form.value),
      active: true,
    });
    setShowForm(false);
    setForm({ code: "", type: "percentage", value: 10 });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount code?")) return;
    await deleteAdminDiscount(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-admin-text">Discounts</h1>
          <p className="mt-1 text-sm text-admin-muted">Flat, percentage, and festival promo codes</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg"
        >
          {showForm ? "Cancel" : "New code"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-wrap items-end gap-4 rounded-lg border border-admin-border bg-admin-surface p-5"
        >
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Code</span>
            <input
              required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="mt-1 block rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm uppercase text-admin-text"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 block rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount (paise)</option>
              <option value="bogo">BOGO</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Value</span>
            <input
              type="number"
              required
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
              className="mt-1 block rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <button type="submit" className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg">
            Create
          </button>
        </form>
      )}

      <AdminTable columns={["Code", "Type", "Value", "Used", "Status", ""]}>
        {discounts.map((discount) => (
          <AdminTableRow key={discount.id}>
            <AdminTableCell className="font-mono font-medium">{discount.code}</AdminTableCell>
            <AdminTableCell>{discount.type}</AdminTableCell>
            <AdminTableCell>
              {discount.type === "percentage" ? `${discount.value}%` : `₹${discount.value / 100}`}
            </AdminTableCell>
            <AdminTableCell>
              {discount.usageCount}
              {discount.usageLimit ? ` / ${discount.usageLimit}` : ""}
            </AdminTableCell>
            <AdminTableCell>
              <span className={discount.active ? "text-admin-success" : "text-admin-danger"}>
                {discount.active ? "Active" : "Inactive"}
              </span>
            </AdminTableCell>
            <AdminTableCell>
              <button
                type="button"
                onClick={() => void handleDelete(discount.id)}
                className="text-xs uppercase tracking-widest text-admin-danger hover:underline"
              >
                Delete
              </button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>
    </div>
  );
}
