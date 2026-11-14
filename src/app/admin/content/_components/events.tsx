"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, errorMessage } from "@/lib/api";
import { fmtDateTime, type FreeEvent, type Paginated } from "@/lib/admin-types";
import { TrashIcon } from "@/components/icons";
import { LoadingButton } from "@/components/loading";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataState } from "@/components/admin/data-state";
import { outlineBtn, type SetBanner } from "./hooks";

const empty = { title: "", startsAt: "", location: "", link: "", description: "", status: "published" };

export function EventsSection({ setBanner }: { setBanner: SetBanner }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<FreeEvent>>("/api/v1/admin/events/?page_size=20&ordering=-starts_at");
  const [f, setF] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<FreeEvent | null>(null);

  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v }));
  const rows = data?.results ?? [];

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return setFormError("Give the event a title.");
    if (!f.startsAt || Number.isNaN(new Date(f.startsAt).getTime())) return setFormError("Choose a date and time.");
    if (f.link.trim() && !/^https?:\/\//i.test(f.link.trim())) return setFormError("The link has to start with http:// or https://.");

    setFormError(null);
    setBanner(null);
    setSaving(true);
    try {
      await api("/api/v1/admin/events/", {
        method: "POST",
        body: JSON.stringify({
          title: f.title.trim(),
          description: f.description.trim(),
          starts_at: new Date(f.startsAt).toISOString(),
          location: f.location.trim(),
          link: f.link.trim(),
          is_published: f.status === "published",
        }),
      });
      setBanner({ kind: "ok", msg: `Event "${f.title.trim()}" saved` });
      setF(empty);
      await mutate();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(ev: FreeEvent) {
    setBusyId(ev.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/events/${ev.id}/`, { method: "PATCH", body: JSON.stringify({ is_published: !ev.is_published }) });
      setBanner({ kind: "ok", msg: `"${ev.title}" ${ev.is_published ? "unpublished" : "published"}` });
      await mutate();
    } catch (err) {
      setBanner({ kind: "err", msg: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusyId(deleting.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/events/${deleting.id}/`, { method: "DELETE" });
      setBanner({ kind: "ok", msg: `Event "${deleting.title}" deleted` });
      await mutate();
    } catch (err) {
      setBanner({ kind: "err", msg: errorMessage(err) });
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  }

  return (
    <section className="card space-y-3 dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Free UTME events</h2>
      <form onSubmit={create} className="space-y-3">
        <label className="block text-sm font-semibold">Title
          <input className="field mt-1" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={150} />
        </label>
        <label className="block text-sm font-semibold">Date &amp; time
          <input type="datetime-local" className="field mt-1" value={f.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">Location
          <input className="field mt-1" value={f.location} onChange={(e) => set("location", e.target.value)} maxLength={200} />
        </label>
        <label className="block text-sm font-semibold">Link
          <input className="field mt-1" value={f.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" />
        </label>
        <label className="block text-sm font-semibold">Description
          <textarea rows={2} className="field mt-1" value={f.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">Status
          <select className="field mt-1" value={f.status} onChange={(e) => set("status", e.target.value)}>
            <option>published</option><option>draft</option>
          </select>
        </label>
        {formError ? <p className="text-sm font-semibold text-red-700" role="alert">⛔ {formError}</p> : null}
        <LoadingButton type="submit" loading={saving} loadingText="Saving…" className="btn-primary w-full">Add event</LoadingButton>
      </form>

      <DataState
        loading={isLoading && !data}
        error={error && !data ? error : null}
        empty={rows.length === 0}
        emptyText="No events yet."
        onRetry={() => mutate()}
      >
        <ul className="text-sm">
          {rows.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
              <span className="min-w-0 flex-1">
                {fmtDateTime(ev.starts_at)} — {ev.title}{" "}
                <span className="text-xs text-neutral-500 dark:text-white/60">({ev.is_published ? "published" : "draft"})</span>
              </span>
              <button type="button" disabled={busyId === ev.id} onClick={() => togglePublished(ev)} className={outlineBtn}>
                {ev.is_published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                disabled={busyId === ev.id}
                onClick={() => setDeleting(ev)}
                aria-label={`Delete ${ev.title}`}
                title="Delete event"
                className="flex items-center rounded border border-red-600 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <TrashIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      </DataState>

      <ConfirmDialog
        open={!!deleting}
        danger
        title={`Delete "${deleting?.title}"?`}
        confirmLabel="Delete event"
        busyLabel="Deleting…"
        busy={!!deleting && busyId === deleting.id}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
        message="This can't be undone. To hide it without deleting, unpublish it instead."
      />
    </section>
  );
}