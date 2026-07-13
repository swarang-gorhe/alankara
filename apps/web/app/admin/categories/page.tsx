"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategoriesAdmin,
} from "@/lib/api/admin";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Array<{ id: string; slug: string; name: string }>>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");

  const load = () => {
    fetchAdminCategoriesAdmin().then((d) => setItems(d.items));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdminCategory({ slug, name });
    setSlug("");
    setName("");
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-admin-text">Categories</h1>
      <form onSubmit={(e) => void handleCreate(e)} className="flex flex-wrap gap-3">
        <input
          placeholder="slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
        />
        <input
          placeholder="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
        />
        <button
          type="submit"
          className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg"
        >
          Add
        </button>
      </form>
      <AdminTable columns={["Name", "Slug", ""]}>
        {items.map((c) => (
          <AdminTableRow key={c.id}>
            <AdminTableCell>{c.name}</AdminTableCell>
            <AdminTableCell className="font-mono text-xs">{c.slug}</AdminTableCell>
            <AdminTableCell>
              <button
                type="button"
                onClick={() => void deleteAdminCategory(c.id).then(load)}
                className="text-xs text-admin-danger"
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
