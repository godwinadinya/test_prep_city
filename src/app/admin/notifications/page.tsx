// "use client";

// import { useState } from "react";
// import { DEMO_ADMIN_STATS, DEMO_NOTIFICATION_TEMPLATES } from "@/lib/content";

// export default function AdminNotifications() {
//   const [templates, setTemplates] = useState(DEMO_NOTIFICATION_TEMPLATES);
//   const [note, setNote] = useState<string | null>(null);
//   const s = DEMO_ADMIN_STATS;

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">Notifications</h1>
//       {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}

//       <div className="grid gap-4 sm:grid-cols-4">
//         {[
//           ["Students", s.students],
//           ["Email opt-in", Math.round(s.students * 0.86)],
//           ["SMS opt-in", Math.round(s.students * 0.72)],
//           ["Push opt-in", Math.round(s.students * 0.58)],
//         ].map(([l, v]) => (
//           <div key={String(l)} className="card dark:text-white">
//             <p className="text-xs uppercase text-neutral-500">{l}</p>
//             <p className="text-3xl font-black text-navy-900 dark:text-gold-500">{Number(v).toLocaleString()}</p>
//           </div>
//         ))}
//       </div>

//       <form
//         className="card grid gap-3 sm:grid-cols-2 dark:text-white"
//         onSubmit={(e) => {
//           e.preventDefault();
//           const f = new FormData(e.currentTarget);
//           const code = String(f.get("code") ?? "").toLowerCase().replace(/\s+/g, "_");
//           if (!code) return;
//           setTemplates((list) => [
//             ...list,
//             {
//               id: `n${list.length + 1}`,
//               code,
//               channel: String(f.get("channel") ?? "push"),
//               segment: String(f.get("segment") ?? "all"),
//               subject: String(f.get("subject") ?? ""),
//               body: String(f.get("body") ?? ""),
//               active: true,
//             },
//           ]);
//           setNote(`Template ${code} saved`);
//           e.currentTarget.reset();
//         }}
//       >
//         <h2 className="text-lg font-black text-navy-900 sm:col-span-2 dark:text-white">New template / campaign</h2>
//         <label className="text-sm font-semibold">Code<input name="code" required className="field mt-1" placeholder="streak_at_risk" /></label>
//         <label className="text-sm font-semibold">Channel
//           <select name="channel" className="field mt-1"><option>push</option><option>sms</option><option>email</option></select>
//         </label>
//         <label className="text-sm font-semibold">Segment
//           <select name="segment" className="field mt-1">
//             <option value="all">All students</option>
//             <option value="free">Free plan</option>
//             <option value="paid">Paid plan</option>
//             <option value="streak_at_risk">Streak at risk</option>
//             <option value="expiring">Subscription expiring</option>
//           </select>
//         </label>
//         <label className="text-sm font-semibold">Subject<input name="subject" required className="field mt-1" /></label>
//         <label className="text-sm font-semibold sm:col-span-2">Body
//           <textarea name="body" rows={3} required className="field mt-1" placeholder="Hi {{name}}, your streak ends in 3 hours…" />
//         </label>
//         <div className="sm:col-span-2"><button type="submit" className="btn-primary">Save template</button></div>
//       </form>

//       <section className="card overflow-x-auto dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Templates</h2>
//         <table className="mt-3 w-full min-w-[620px] text-left text-sm">
//           <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">Code</th><th>Channel</th><th>Segment</th><th>Subject</th><th>Status</th></tr></thead>
//           <tbody>
//             {templates.map((t) => (
//               <tr key={t.id} className="border-t border-neutral-200 dark:border-navy-800">
//                 <td className="py-1 font-mono text-xs">{t.code}</td>
//                 <td className="capitalize">{t.channel}</td>
//                 <td>{t.segment}</td>
//                 <td>{t.subject}</td>
//                 <td>{t.active ? "active" : "paused"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <p className="mt-3 text-xs text-neutral-500">
//           Quiet hours and per-user opt-outs are enforced at send time. SMS has a cost cap per student per week.
//         </p>
//       </section>

//     </div>
//   );
// }



"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { api, errorMessage } from "@/lib/api";
import { fetchAllPages, type AllPages } from "@/lib/fetch-all";
import { fmtDate, type AdminOverview, type Campaign, type NotificationTemplate } from "@/lib/admin-types";
import { usePagedList } from "@/components/admin/paged-list";
import { Pagination } from "@/components/admin/pagination";
import { DataState } from "@/components/admin/data-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DummyBadge } from "@/components/admin/dummy-badge";
import { LoadingButton } from "@/components/loading";
import { TrashIcon } from "@/components/icons";
import { outlineBtn, type Banner, type SetBanner } from "../content/_components/hooks";
// import { DEMO_NOTIFICATION_TEMPLATES } from "@/lib/content";


// ASSUMPTION: "in_app" is confirmed by the Postman collection. push, sms and email are my guesses. Verify them with the backend.
const CHANNELS = [
  { value: "push", label: "Push" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-app" },
];
const channelLabel = (c: string) => CHANNELS.find((x) => x.value === c)?.label ?? c;
const asList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const toCode = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
const iconBtn =
  "flex items-center rounded border border-red-600 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50";

/* ------------------------------------------------------------------- Stats */

function StatCards() {
  const { data } = useSWR<AdminOverview>("/api/v1/admin/reports/overview/");
  const students = data?.students;
  // DUMMY: the API has no opt-in counts yet. These use the mock's ratios on the real student count.
  const cards: { label: string; value?: number; dummy: boolean }[] = [
    { label: "Students", value: students, dummy: false },
    { label: "Email opt-in", value: students === undefined ? undefined : Math.round(students * 0.86), dummy: true },
    { label: "SMS opt-in", value: students === undefined ? undefined : Math.round(students * 0.72), dummy: true },
    { label: "Push opt-in", value: students === undefined ? undefined : Math.round(students * 0.58), dummy: true },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500 dark:text-white/60">
            {c.label} {c.dummy ? <DummyBadge /> : null}
          </p>
          <p className="text-3xl font-black text-navy-900 dark:text-gold-500">
            {c.value === undefined ? "—" : c.value.toLocaleString("en-NG")}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ New template */

function TemplateForm({ templates, setBanner, onChanged }: { templates: NotificationTemplate[]; setBanner: SetBanner; onChanged: () => void }) {
  const [code, setCode] = useState("");
  const [channel, setChannel] = useState("push");
  // DUMMY: the API has no audience field on templates, and the campaign segment shape isn't documented. Never sent.
  const [segment, setSegment] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [alsoCampaign, setAlsoCampaign] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = toCode(code);
    const title = subject.trim();
    const text = body.trim();
    if (!c) return setError("Give the template a code, e.g. streak_at_risk.");
    if (c.length > 60) return setError("The code can't be longer than 60 characters.");
    if (templates.some((t) => t.code === c)) return setError(`A template with the code "${c}" already exists.`);
    if (!title) return setError("Add a subject.");
    if (title.length > 150) return setError("The subject can't be longer than 150 characters.");
    if (!text) return setError("Write the message body.");
    if (channel === "sms" && text.length > 300) return setError("SMS text can't be longer than 300 characters.");

    setError(null);
    setBanner(null);
    setSaving(true);
    let templateId: string | null = null;
    try {
      const created = await api<{ id: string }>("/api/v1/admin/notification-templates/", {
        method: "POST",
        body: JSON.stringify({
          code: c,
          category: "engagement", // the only value I've seen, from the Postman collection
          title,
          body: text,
          sms_body: channel === "sms" ? text : "", // ASSUMPTION: the sms_body field is the SMS text
          default_channels: [channel],
          is_active: true,
        }),
      });
      templateId = created.id;

      if (alsoCampaign) {
        await api("/api/v1/admin/campaigns/", {
          method: "POST",
          body: JSON.stringify({
            name: title.slice(0, 120),
            template: created.id,
            segment: {},
            channels: [channel],
            status: "draft",
            sent_count: 0,
          }),
        });
        setBanner({ kind: "ok", msg: `Template ${c} saved and a draft campaign created` });
      } else {
        setBanner({ kind: "ok", msg: `Template ${c} saved` });
      }
      setCode("");
      setSubject("");
      setBody("");
      setSegment("all");
      setAlsoCampaign(false);
      onChanged();
    } catch (err) {
      if (templateId) {
        setBanner({ kind: "err", msg: `Template saved, but the campaign couldn't be created: ${errorMessage(err)}` });
        onChanged();
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card grid gap-3 sm:grid-cols-2 dark:text-white" onSubmit={submit}>
      <h2 className="text-lg font-black text-navy-900 sm:col-span-2 dark:text-white">New template / campaign</h2>
      <label className="text-sm font-semibold">Code
        <input className="field mt-1" value={code} onChange={(e) => setCode(e.target.value)} placeholder="streak_at_risk" />
        {code.trim() && toCode(code) !== code.trim() ? (
          <span className="mt-1 block text-xs font-normal text-neutral-500">Will be saved as: <code>{toCode(code) || "…"}</code></span>
        ) : null}
      </label>
      <label className="text-sm font-semibold">Channel
        <select className="field mt-1" value={channel} onChange={(e) => setChannel(e.target.value)}>
          {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">Segment <DummyBadge label="Not applied yet" />
        <select className="field mt-1" value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option value="all">All students</option>
          <option value="free">Free plan</option>
          <option value="paid">Paid plan</option>
          <option value="streak_at_risk">Streak at risk</option>
          <option value="expiring">Subscription expiring</option>
        </select>
      </label>
      <label className="text-sm font-semibold">Subject
        <input className="field mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">Body
        <textarea rows={3} className="field mt-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi {{name}}, your streak ends in 3 hours…" />
        {channel === "sms" ? <span className="mt-1 block text-xs font-normal text-neutral-500">{body.trim().length}/300 characters for SMS</span> : null}
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input type="checkbox" className="h-4 w-4" checked={alsoCampaign} onChange={(e) => setAlsoCampaign(e.target.checked)} />
        Also create a draft campaign from it (nothing is sent until you press Send below)
      </label>
      {error ? <p className="text-sm font-semibold text-red-700 sm:col-span-2" role="alert">⛔ {error}</p> : null}
      <div className="sm:col-span-2">
        <LoadingButton type="submit" loading={saving} loadingText="Saving…" className="btn-primary">Save template</LoadingButton>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------- Templates */

function TemplatesSection(props: {
  templates: NotificationTemplate[];
  loading: boolean;
  error: unknown;
  retry: () => void;
  setBanner: SetBanner;
  onChanged: () => void;
}) {
  const { templates, loading, error, retry, setBanner, onChanged } = props;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<NotificationTemplate | null>(null);

  async function toggle(t: NotificationTemplate) {
    setBusyId(t.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/notification-templates/${t.id}/`, { method: "PATCH", body: JSON.stringify({ is_active: !t.is_active }) });
      setBanner({ kind: "ok", msg: `Template ${t.code} ${t.is_active ? "paused" : "activated"}` });
      onChanged();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
    }
  }

  async function createCampaign(t: NotificationTemplate) {
    const channels = asList(t.default_channels);
    setBusyId(t.id);
    setBanner(null);
    try {
      await api("/api/v1/admin/campaigns/", {
        method: "POST",
        body: JSON.stringify({
          name: t.title.slice(0, 120),
          template: t.id,
          segment: {},
          channels: channels.length ? channels : ["in_app"],
          status: "draft",
          sent_count: 0,
        }),
      });
      setBanner({ kind: "ok", msg: `Draft campaign created from ${t.code}. Nothing has been sent.` });
      onChanged();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusyId(deleting.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/notification-templates/${deleting.id}/`, { method: "DELETE" });
      setBanner({ kind: "ok", msg: `Template ${deleting.code} deleted` });
      onChanged();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  }

  return (
    <section className="card overflow-x-auto dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Templates</h2>
      <div className="mt-3">
        <DataState loading={loading} error={error} empty={templates.length === 0} emptyText="No templates yet. Create one above." onRetry={retry}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500 dark:text-white/60">
              <tr><th className="py-1">Code</th><th>Channel</th><th>Segment</th><th>Subject</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-t border-neutral-200 align-top dark:border-navy-800">
                  <td className="py-1 font-mono text-xs">{t.code}</td>
                  <td>{asList(t.default_channels).map(channelLabel).join(", ") || "—"}</td>
                  <td title="Audiences belong to campaigns, and aren't connected yet" className="text-neutral-500">—</td>
                  <td>{t.title}</td>
                  <td>{t.is_active ? "active" : "paused"}</td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" disabled={busyId === t.id} onClick={() => createCampaign(t)} className={outlineBtn}>Create campaign</button>
                      <button type="button" disabled={busyId === t.id} onClick={() => toggle(t)} className={outlineBtn}>{t.is_active ? "Pause" : "Activate"}</button>
                      <button type="button" disabled={busyId === t.id} onClick={() => setDeleting(t)} aria-label={`Delete ${t.code}`} title="Delete template" className={iconBtn}>
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataState>
      </div>
      {/* DUMMY: this copy is from the mock. Ask the backend whether quiet hours, opt-outs and the SMS cost cap really exist. */}
      <p className="mt-3 text-xs text-neutral-500 dark:text-white/60">
        Quiet hours and per-user opt-outs are enforced at send time. SMS has a cost cap per student per week.
      </p>

      <ConfirmDialog
        open={!!deleting}
        danger
        title={`Delete the "${deleting?.code}" template?`}
        confirmLabel="Delete template"
        busyLabel="Deleting…"
        busy={!!deleting && busyId === deleting.id}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
        message="This can't be undone. A template that campaigns use may refuse to be deleted. To stop it being used, pause it instead."
      />
    </section>
  );
}

/* --------------------------------------------------------------- Campaigns */

function CampaignsSection({ templates, setBanner, refreshKey }: { templates: NotificationTemplate[]; setBanner: SetBanner; refreshKey: number }) {
  const list = usePagedList<Campaign>("/api/v1/admin/campaigns/", { pageSize: 10, filters: { ordering: "-created_at" } });
  const codeById = useMemo(() => new Map(templates.map((t) => [t.id, t.code])), [templates]);
  const [sending, setSending] = useState<Campaign | null>(null);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Refetch when a template or campaign is created elsewhere on the page.
  useEffect(() => {
    if (refreshKey > 0) list.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  function closeSend() {
    setSending(null);
    setTyped("");
  }

  async function send() {
    if (!sending) return;
    setBusyId(sending.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/campaigns/${sending.id}/send/`, { method: "POST" });
      setBanner({ kind: "ok", msg: `Campaign "${sending.name}" queued for sending` });
      await list.mutate();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
      closeSend();
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusyId(deleting.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/campaigns/${deleting.id}/`, { method: "DELETE" });
      setBanner({ kind: "ok", msg: `Campaign "${deleting.name}" deleted` });
      await list.mutate();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  }

  // ASSUMPTION: a campaign that hasn't been sent has the status "draft" (from the Postman collection).
  const isDraft = (c: Campaign) => c.status.toLowerCase() === "draft";

  return (
    <section className="card overflow-x-auto dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Campaigns</h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">
        A campaign sends a template. Create one from the template form or the Templates table, then press Send.
      </p>

      <div className="mt-3">
        <DataState
          loading={list.isLoading && !list.data}
          error={list.error && !list.data ? list.error : null}
          empty={list.rows.length === 0}
          emptyText="No campaigns yet."
          onRetry={() => list.mutate()}
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500 dark:text-white/60">
              <tr><th className="py-1">Name</th><th>Template</th><th>Channels</th><th>Status</th><th>Sent</th><th>Created</th><th /></tr>
            </thead>
            <tbody>
              {list.rows.map((c) => (
                <tr key={c.id} className="border-t border-neutral-200 align-top dark:border-navy-800">
                  <td className="py-1 font-semibold">{c.name}</td>
                  <td className="font-mono text-xs">{codeById.get(c.template) ?? `${c.template.slice(0, 8)}…`}</td>
                  <td>{asList(c.channels).map(channelLabel).join(", ") || "—"}</td>
                  <td className="capitalize">{c.status}</td>
                  <td>{c.sent_count}</td>
                  <td className="text-neutral-600 dark:text-white/70">{fmtDate(c.created_at)}</td>
                  <td>
                    {isDraft(c) ? (
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={busyId === c.id} onClick={() => setSending(c)} className={outlineBtn}>Send…</button>
                        <button type="button" disabled={busyId === c.id} onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`} title="Delete draft" className={iconBtn}>
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataState>
      </div>

      <div className="mt-3">
        <Pagination page={list.page} totalPages={list.totalPages} total={list.total} pageSize={list.pageSize} hasPrev={list.hasPrev} hasNext={list.hasNext} onPage={list.setPage} />
      </div>

      <ConfirmDialog
        open={!!sending}
        danger
        title={`Send "${sending?.name}"?`}
        confirmLabel="Send now"
        busyLabel="Sending…"
        confirmDisabled={typed.trim().toUpperCase() !== "SEND"}
        busy={!!sending && busyId === sending.id}
        onConfirm={send}
        onCancel={closeSend}
        message={
          <div>
            <p>
              This sends real notifications to students on: <strong>{sending ? asList(sending.channels).map(channelLabel).join(", ") || "the template's channels" : ""}</strong>.
              It can&apos;t be undone.
            </p>
            {/* DUMMY: audience filters aren't connected, so the segment is empty. */}
            <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">
              Audience filters aren&apos;t connected yet, so this campaign has an empty segment and the backend decides who receives it.
              Check with your backend developer what that means before sending to real students.
            </p>
            <label htmlFor="send-confirm" className="mt-3 block font-semibold">Type SEND to confirm</label>
            <input id="send-confirm" className="field mt-1" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        }
      />

      <ConfirmDialog
        open={!!deleting}
        danger
        title={`Delete the draft "${deleting?.name}"?`}
        confirmLabel="Delete draft"
        busyLabel="Deleting…"
        busy={!!deleting && busyId === deleting.id}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
        message="Nothing was sent. This can't be undone."
      />
    </section>
  );
}

/* --------------------------------------------------------------------- Page */

export default function AdminNotifications() {
  const { mutate } = useSWRConfig();
  const [banner, setBanner] = useState<Banner>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (banner?.kind !== "ok") return;
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  const templatesQ = useSWR<AllPages<NotificationTemplate>>(
    "/api/v1/admin/notification-templates/?page_size=100",
    (k: string) => fetchAllPages<NotificationTemplate>(k),
  );
  const templates = templatesQ.data?.items ?? [];

  const onChanged = () => {
    mutate((key) => typeof key === "string" && /^\/api\/v1\/admin\/(notification-templates|campaigns)\//.test(key));
    setRefreshKey((n) => n + 1);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Notifications</h1>

      {banner ? (
        <p
          role={banner.kind === "err" ? "alert" : "status"}
          className={
            "sticky top-16 z-30 rounded-lg p-3 text-sm font-semibold shadow " +
            (banner.kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")
          }
        >
          {banner.kind === "ok" ? "✅" : "⛔"} {banner.msg}
        </p>
      ) : null}

      <StatCards />
      <TemplateForm templates={templates} setBanner={setBanner} onChanged={onChanged} />
      <TemplatesSection
        templates={templates}
        loading={templatesQ.isLoading && !templatesQ.data}
        error={templatesQ.error && !templatesQ.data ? templatesQ.error : null}
        retry={() => templatesQ.mutate()}
        setBanner={setBanner}
        onChanged={onChanged}
      />
      <CampaignsSection templates={templates} setBanner={setBanner} refreshKey={refreshKey} />
    </div>
  );
}