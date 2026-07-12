"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  createAdminFaq,
  deleteAdminFaq,
  fetchAdminFaq,
  type AdminFaq,
} from "@/lib/api/admin";

export default function AdminFaqPage() {
  const [entries, setEntries] = useState<AdminFaq[]>([]);
  const [showForm, setShowForm] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-maroon">FAQ</h1>
          <p className="mt-1 text-sm text-charcoal-muted">
            Knowledge base entries — indexed for AI in Phase 7
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New entry"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="space-y-4 rounded-sm border border-gold/25 bg-cream-light p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-charcoal-muted">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-charcoal-muted">Category</span>
              <input
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">Question</span>
            <input
              required
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">Answer</span>
            <textarea
              required
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              rows={4}
            />
          </label>
          <Button type="submit">Create entry</Button>
        </form>
      )}

      <AdminTable columns={["Question", "Category", "Published", ""]}>
        {entries.map((entry) => (
          <AdminTableRow key={entry.id}>
            <AdminTableCell>
              <p className="font-medium">{entry.question}</p>
              <p className="mt-1 line-clamp-2 text-xs text-charcoal-muted">{entry.answer}</p>
            </AdminTableCell>
            <AdminTableCell>{entry.category}</AdminTableCell>
            <AdminTableCell>{entry.published ? "Yes" : "No"}</AdminTableCell>
            <AdminTableCell>
              <button
                type="button"
                onClick={() => void handleDelete(entry.id)}
                className="text-xs uppercase tracking-widest text-maroon hover:underline"
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
