"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  createAdminFaq,
  deleteAdminFaq,
  fetchAdminFaq,
  updateAdminFaq,
  type AdminFaq,
} from "@/lib/api/admin";

export default function AdminFaqPage() {
  const [entries, setEntries] = useState<AdminFaq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    question: "",
    answer: "",
    category: "general",
  });

  const load = () => {
    fetchAdminFaq().then((data) => setEntries(data.items));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createAdminFaq(form);
    setShowForm(false);
    setForm({ slug: "", question: "", answer: "", category: "general" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ entry?")) return;
    await deleteAdminFaq(id);
    load();
  };

  const startEdit = (entry: AdminFaq) => {
    setEditingId(entry.id);
    setShowForm(false);
    setForm({
      slug: entry.slug,
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    await updateAdminFaq(editingId, form);
    setEditingId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-admin-text">FAQ</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Knowledge base for textile jewellery — indexed for AI chat
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg"
        >
          {showForm ? "Cancel" : "New entry"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="space-y-4 rounded-lg border border-admin-border bg-admin-surface p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-admin-muted">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-admin-muted">Category</span>
              <input
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Question</span>
            <input
              required
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Answer</span>
            <textarea
              required
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              rows={4}
            />
          </label>
          <button type="submit" className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg">
            Create entry
          </button>
        </form>
      )}

      {editingId && (
        <form
          onSubmit={(e) => void handleUpdate(e)}
          className="space-y-4 rounded-lg border border-admin-accent/40 bg-admin-surface p-5"
        >
          <p className="font-display text-lg text-admin-text">Edit FAQ</p>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Question</span>
            <input
              required
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Answer</span>
            <textarea
              required
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              rows={4}
            />
          </label>
          <div className="flex gap-3">
            <button type="submit" className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg">
              Save
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="text-xs text-admin-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      <AdminTable columns={["Question", "Category", "Published", ""]}>
        {entries.map((entry) => (
          <AdminTableRow key={entry.id}>
            <AdminTableCell>
              <p className="font-medium">{entry.question}</p>
              <p className="mt-1 line-clamp-2 text-xs text-admin-muted">{entry.answer}</p>
            </AdminTableCell>
            <AdminTableCell>{entry.category}</AdminTableCell>
            <AdminTableCell>{entry.published ? "Yes" : "No"}</AdminTableCell>
            <AdminTableCell className="flex gap-3">
              <button
                type="button"
                onClick={() => startEdit(entry)}
                className="text-xs uppercase tracking-widest text-admin-accent hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(entry.id)}
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
