
"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, errorMessage } from "@/lib/api";
import {
  fmtDateTime,
  type Badge,
  type IntegrityFlag,
  type Level,
  type Paginated,
  type XpRule,
} from "@/lib/admin-types";
import { DataState } from "@/components/admin/data-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { LoadingButton } from "@/components/loading";
import { TrashIcon } from "@/components/icons";

type Banner = { kind: "ok" | "err"; msg: string } | null;
type SetBanner = (b: Banner) => void;
type Parsed =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

const outlineBtn =
  "rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 disabled:opacity-50 dark:border-gold-500 dark:text-gold-500";

const pretty = (v: unknown) => JSON.stringify(v ?? {}, null, 2);
const compact = (v: unknown) => JSON.stringify(v ?? {});
const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};

function parseObject(text: string): Parsed {
  try {
    const v = JSON.parse(text);
    if (v === null || typeof v !== "object" || Array.isArray(v))
      return { ok: false, error: 'Must be a JSON object, like {"xp": 5}.' };
    return { ok: true, value: v as Record<string, unknown> };
  } catch {
    return { ok: false, error: "That isn't valid JSON." };
  }
}

/* ----------------------------------------------------------------- XP rules */

function XpRuleCard({
  rule,
  setBanner,
  onSaved,
}: {
  rule: XpRule;
  setBanner: SetBanner;
  onSaved: () => void;
}) {
  const [text, setText] = useState(pretty(rule.params));
  const [active, setActive] = useState(rule.is_active);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const parsed = parseObject(text);
  const dirty =
    active !== rule.is_active ||
    (parsed.ok && compact(parsed.value) !== compact(asObject(rule.params)));

  async function save() {
    if (!parsed.ok) return;
    setSaving(true);
    setBanner(null);
    try {
      await api(`/api/v1/admin/xp-rules/${rule.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ params: parsed.value, is_active: active }),
      });
      setBanner({ kind: "ok", msg: `XP rule "${rule.action}" updated` });
      onSaved();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    setBanner(null);
    try {
      await api(`/api/v1/admin/xp-rules/${rule.id}/`, { method: "DELETE" });
      setBanner({ kind: "ok", msg: `XP rule "${rule.action}" deleted` });
      onSaved();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
      <p className="font-mono font-bold">{rule.action}</p>
      {rule.description ? (
        <p className="text-xs text-neutral-500">{rule.description}</p>
      ) : null}
      <label className="mt-2 block text-xs font-semibold">
        Settings (JSON)
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          spellCheck={false}
          className="field mt-1 font-mono text-xs"
        />
      </label>
      {!parsed.ok ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {parsed.error}
        </p>
      ) : null}
      <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4"
        />
        Active
      </label>

      <div className="mt-2 flex gap-2">
        <LoadingButton
          type="button"
          loading={saving}
          loadingText="Saving…"
          disabled={!dirty || !parsed.ok}
          onClick={save}
          className="btn-navy flex-1 px-3 py-1.5 text-xs"
        >
          Save
        </LoadingButton>
        <button
          type="button"
          disabled={saving}
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete ${rule.action}`}
          title="Delete rule"
          className="flex items-center justify-center rounded border border-red-600 px-2.5 text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <TrashIcon />
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title={`Delete the "${rule.action}" rule?`}
        confirmLabel="Delete rule"
        busyLabel="Deleting…"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
        message="This can't be undone. If you only want to pause it, untick Active and save instead. The deletion is written to the audit log."
      />

      <ConfirmDialog
        open={confirmDelete}
        danger
        title={`Delete the "${rule.action}" rule?`}
        confirmLabel="Delete rule"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
        message="This can't be undone. If you only want to pause it, untick Active and save instead. The deletion is written to the audit log."
      />
    </div>
  );
}

const toAction = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function XpRulesSection({ setBanner }: { setBanner: SetBanner }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<XpRule>>(
    "/api/v1/admin/xp-rules/?page_size=100",
  );
  const rules = data?.results ?? [];

  const [action, setAction] = useState("");
  const [description, setDescription] = useState("");
  const [params, setParams] = useState('{"xp": 5}');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    // const a = action.trim();
    // if (!/^[a-z][a-z0-9_]{1,39}$/.test(a)) return setFormError("Use lowercase letters, numbers and underscores (2 to 40 characters).");
    const a = toAction(action);
    if (!/^[a-z][a-z0-9_]{1,39}$/.test(a))
      return setFormError(
        "The name has to start with a letter and be at least 2 characters, e.g. streak_5_days.",
      );
    if (rules.some((r) => r.action === a))
      return setFormError(
        "A rule for this action already exists. Edit it above instead.",
      );
    const parsed = parseObject(params);
    if (!parsed.ok) return setFormError(parsed.error);

    setFormError(null);
    setBanner(null);
    setCreating(true);
    try {
      await api("/api/v1/admin/xp-rules/", {
        method: "POST",
        body: JSON.stringify({
          action: a,
          params: parsed.value,
          is_active: true,
          description: description.trim(),
        }),
      });
      setBanner({ kind: "ok", msg: `XP rule "${a}" created` });
      setAction("");
      setDescription("");
      setParams('{"xp": 5}');
      await mutate();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        XP rules (editable configuration)
      </h2>
      <p className="text-xs text-neutral-500">
        Every change is written to the audit log.
      </p>

      <div className="mt-3">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={rules.length === 0}
          emptyText="No XP rules yet."
          onRetry={() => mutate()}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {rules.map((r) => (
              // The key changes after a save, so the card resets to the saved values.
              <XpRuleCard
                key={`${r.id}:${compact(r.params)}:${r.is_active}`}
                rule={r}
                setBanner={setBanner}
                onSaved={() => mutate()}
              />
            ))}
          </div>
        </DataState>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">
          Add a rule
        </summary>
        <p className="mt-2 text-xs text-neutral-500">
          The action name has to match an event the backend already awards XP
          for. A name it doesn&apos;t know does nothing.
        </p>
        <form onSubmit={create} className="mt-2 flex flex-wrap items-end gap-3">
          {/* <label className="text-sm font-semibold">Action
            <input value={action} onChange={(e) => setAction(e.target.value)} className="field mt-1 font-mono" placeholder="lesson_complete" />
          </label> */}
          <label className="text-sm font-semibold">
            Action
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="field mt-1 font-mono"
              placeholder="lesson_complete"
            />
            {action.trim() ? (
              <span className="mt-1 block text-xs font-normal text-neutral-500">
                Will be saved as: <code>{toAction(action) || "…"}</code>
              </span>
            ) : null}
          </label>
          <label className="flex-1 text-sm font-semibold">
            Description
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="field mt-1"
            />
          </label>
          <label className="w-full text-sm font-semibold">
            Settings (JSON)
            <textarea
              value={params}
              onChange={(e) => setParams(e.target.value)}
              rows={3}
              spellCheck={false}
              className="field mt-1 font-mono text-xs"
            />
          </label>
          <LoadingButton
            type="submit"
            loading={creating}
            loadingText="Creating…"
            className="btn-primary"
          >
            Create rule
          </LoadingButton>
        </form>
        {formError ? (
          <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
            ⛔ {formError}
          </p>
        ) : null}
      </details>

      <p className="mt-3 text-xs text-neutral-500">
        Diminishing returns are applied to repeated identical questions to
        prevent farming.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------- Levels */

function groupTiers(levels: Level[]) {
  const map = new Map<string, { from: number; to: number; xp: number }>();
  for (const l of levels) {
    const name = l.tier || "Untiered";
    const g = map.get(name);
    if (!g) map.set(name, { from: l.number, to: l.number, xp: l.xp_threshold });
    else {
      g.from = Math.min(g.from, l.number);
      g.to = Math.max(g.to, l.number);
      g.xp = Math.min(g.xp, l.xp_threshold);
    }
  }
  return [...map.entries()]
    .map(([name, g]) => ({ name, ...g }))
    .sort((a, b) => a.from - b.from);
}

function LevelRow(props: {
  level: Level;
  prevXp?: number;
  nextXp?: number;
  setBanner: SetBanner;
  onSaved: () => void;
}) {
  const { level, prevXp, nextXp, setBanner, onSaved } = props;
  const [name, setName] = useState(level.name);
  const [tier, setTier] = useState(level.tier);
  const [xp, setXp] = useState(String(level.xp_threshold));
  const [saving, setSaving] = useState(false);

  const n = Number(xp);
  const intOk = xp.trim() !== "" && Number.isInteger(n) && n >= 0;
  const orderOk =
    intOk &&
    (prevXp === undefined || n > prevXp) &&
    (nextXp === undefined || n < nextXp);
  const dirty =
    name !== level.name ||
    tier !== level.tier ||
    (intOk && n !== level.xp_threshold);

  async function save() {
    setSaving(true);
    setBanner(null);
    try {
      await api(`/api/v1/admin/levels/${level.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          tier: tier.trim(),
          xp_threshold: n,
        }),
      });
      setBanner({ kind: "ok", msg: `Level ${level.number} updated` });
      onSaved();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-neutral-200 align-top dark:border-navy-800">
      <td className="py-2 pr-2 font-bold">{level.number}</td>
      <td className="pr-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="field w-40"
          aria-label={`Level ${level.number} name`}
        />
      </td>
      <td className="pr-2">
        <input
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          maxLength={30}
          className="field w-32"
          aria-label={`Level ${level.number} tier`}
        />
      </td>
      <td className="pr-2">
        <input
          value={xp}
          onChange={(e) => setXp(e.target.value)}
          inputMode="numeric"
          className="field w-28"
          aria-label={`Level ${level.number} XP threshold`}
        />
        {!orderOk ? (
          <p className="mt-1 text-xs text-red-700">
            {!intOk
              ? "Whole number, 0 or more."
              : `Must be ${prevXp !== undefined ? `above ${prevXp.toLocaleString()}` : ""}${prevXp !== undefined && nextXp !== undefined ? " and " : ""}${nextXp !== undefined ? `below ${nextXp.toLocaleString()}` : ""}.`}
          </p>
        ) : null}
      </td>
      <td>
        <LoadingButton
          type="button"
          loading={saving}
          loadingText="Saving…"
          disabled={!dirty || !orderOk}
          onClick={save}
          className="btn-navy px-3 py-1.5 text-xs"
        >
          Save
        </LoadingButton>
      </td>
    </tr>
  );
}

function LevelsSection({ setBanner }: { setBanner: SetBanner }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<Level>>(
    "/api/v1/admin/levels/?page_size=100",
  );
  const levels = [...(data?.results ?? [])].sort((a, b) => a.number - b.number);
  const tiers = groupTiers(levels);
  const first = levels[0]?.number;
  const last = levels[levels.length - 1]?.number;

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        Level thresholds {levels.length ? `(${first}–${last})` : ""}
      </h2>
      <div className="mt-3">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={levels.length === 0}
          emptyText="No levels yet."
          onRetry={() => mutate()}
        >
          <div className="flex flex-wrap gap-2 text-xs">
            {tiers.map((t) => (
              <span
                key={t.name}
                className="rounded-full bg-navy-100 px-3 py-1 font-bold text-navy-900"
              >
                {t.name}: levels {t.from}–{t.to} ({t.xp.toLocaleString()}+ XP)
              </span>
            ))}
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">
              Edit levels
            </summary>
            <p className="mt-2 text-xs text-neutral-500">
              XP thresholds must keep increasing with the level number.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase text-neutral-500">
                  <tr>
                    <th className="py-1">#</th>
                    <th>Name</th>
                    <th>Tier</th>
                    <th>XP threshold</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {levels.map((l, i) => (
                    <LevelRow
                      key={`${l.id}:${l.name}:${l.tier}:${l.xp_threshold}`}
                      level={l}
                      prevXp={levels[i - 1]?.xp_threshold}
                      nextXp={levels[i + 1]?.xp_threshold}
                      setBanner={setBanner}
                      onSaved={() => mutate()}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </DataState>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Badges */

const RARITIES = ["common", "rare", "legendary"];

function BadgeCard({
  badge,
  setBanner,
  onSaved,
}: {
  badge: Badge;
  setBanner: SetBanner;
  onSaved: () => void;
}) {
  const params = asObject(badge.criteria_params);
  const entries = Object.entries(params);
  // One numeric setting becomes a simple number box. Anything else is edited as JSON.
  const single =
    entries.length === 1 && typeof entries[0][1] === "number"
      ? entries[0]
      : null;

  const [num, setNum] = useState(single ? String(single[1]) : "");
  const [json, setJson] = useState(pretty(params));
  const [rarity, setRarity] = useState(badge.rarity);
  const [active, setActive] = useState(badge.is_active);
  const [saving, setSaving] = useState(false);

  const parsed: Parsed = single
    ? num.trim() !== "" && Number.isFinite(Number(num)) && Number(num) >= 0
      ? { ok: true, value: { [single[0]]: Number(num) } }
      : { ok: false, error: "Enter a number of 0 or more." }
    : parseObject(json);

  const dirty =
    rarity !== badge.rarity ||
    active !== badge.is_active ||
    (parsed.ok && compact(parsed.value) !== compact(params));

  const rarityOptions =
    RARITIES.includes(badge.rarity) || !badge.rarity
      ? RARITIES
      : [...RARITIES, badge.rarity];

  async function save() {
    if (!parsed.ok) return;
    setSaving(true);
    setBanner(null);
    try {
      await api(`/api/v1/admin/badges/${badge.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          rarity,
          is_active: active,
          criteria_params: parsed.value,
        }),
      });
      setBanner({ kind: "ok", msg: `Badge "${badge.name}" updated` });
      onSaved();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
      <p className="font-bold">{badge.name}</p>
      <p className="text-xs text-neutral-500">
        {badge.category} · criteria: {badge.criteria_type.replace(/_/g, " ")}
      </p>
      {badge.description ? (
        <p className="mt-1 text-xs text-neutral-600 dark:text-white/70">
          {badge.description}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-end gap-2">
        {single ? (
          <label className="text-xs font-semibold">
            {single[0].replace(/_/g, " ")}
            <input
              value={num}
              onChange={(e) => setNum(e.target.value)}
              inputMode="numeric"
              className="field mt-1 w-24"
            />
          </label>
        ) : null}
        <label className="text-xs font-semibold">
          Rarity
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="field mt-1 w-28"
          >
            {rarityOptions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 text-xs font-semibold">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4"
          />
          Active
        </label>
      </div>

      {!single && entries.length > 0 ? (
        <label className="mt-2 block text-xs font-semibold">
          Criteria settings (JSON)
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={3}
            spellCheck={false}
            className="field mt-1 font-mono text-xs"
          />
        </label>
      ) : null}
      {!parsed.ok ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {parsed.error}
        </p>
      ) : null}

      <LoadingButton
        type="button"
        loading={saving}
        loadingText="Saving…"
        disabled={!dirty || !parsed.ok}
        onClick={save}
        className="btn-navy mt-2 w-full px-3 py-1.5 text-xs"
      >
        Save
      </LoadingButton>
    </div>
  );
}

function BadgesSection({ setBanner }: { setBanner: SetBanner }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<Badge>>(
    "/api/v1/admin/badges/?page_size=100",
  );
  const badges = data?.results ?? [];

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        Badge catalogue
      </h2>
      <div className="mt-3">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={badges.length === 0}
          emptyText="No badges yet."
          onRetry={() => mutate()}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {badges.map((b) => (
              <BadgeCard
                key={`${b.id}:${b.rarity}:${b.is_active}:${compact(b.criteria_params)}`}
                badge={b}
                setBanner={setBanner}
                onSaved={() => mutate()}
              />
            ))}
          </div>
        </DataState>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Integrity queue */

// ASSUMPTION: the status names are unknown, so anything not clearly finished counts as open.
const FLAG_CLOSED = ["confirmed", "dismissed", "resolved", "cleared"];
const isOpenFlag = (f: IntegrityFlag) =>
  !FLAG_CLOSED.includes(f.status.toLowerCase());

function IntegritySection({ setBanner }: { setBanner: SetBanner }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<IntegrityFlag>>(
    "/api/v1/admin/integrity-flags/?page_size=50&ordering=-created_at",
  );
  const [view, setView] = useState<"open" | "all">("open");
  const [confirming, setConfirming] = useState<IntegrityFlag | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const all = data?.results ?? [];
  const openCount = all.filter(isOpenFlag).length;
  const rows = view === "open" ? all.filter(isOpenFlag) : all;

  async function decide(f: IntegrityFlag, action: "confirm" | "dismiss") {
    setBusyId(f.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/integrity-flags/${f.id}/${action}/`, {
        method: "POST",
      });
      setBanner({
        kind: "ok",
        msg:
          action === "confirm"
            ? `Abuse confirmed for ${f.nickname} · entries stay off the boards`
            : `Flag on ${f.nickname} dismissed`,
      });
      await mutate();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }

  return (
    <section className="card dark:text-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">
          Integrity review queue {openCount ? `(${openCount} open)` : ""}
        </h2>
        <div className="flex gap-2 text-sm">
          {(["open", "all"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={
                "rounded-full px-3 py-1 font-semibold " +
                (view === v
                  ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900"
                  : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
              }
            >
              {v === "open" ? "Open" : "All"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-neutral-500">
        Flags come from abnormal answer speed, duplicate-account signals and XP
        farming patterns.
      </p>

      <div className="mt-3">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={rows.length === 0}
          emptyText={
            view === "open"
              ? "No flagged entries need review."
              : "No flagged entries."
          }
          onRetry={() => mutate()}
        >
          <ul className="space-y-2 text-sm">
            {rows.map((f) => {
              const evidence = asObject(f.evidence);
              return (
                <li
                  key={f.id}
                  className="flex flex-wrap items-start gap-2 border-b border-neutral-200 py-2 dark:border-navy-800"
                >
                  <span className="flex-1">
                    <strong>{f.nickname || "Unknown student"}</strong> ·{" "}
                    {f.reason.replace(/_/g, " ")} · {fmtDateTime(f.created_at)}
                    <span className="block text-xs text-neutral-500">
                      status: {f.status}
                    </span>
                    {Object.keys(evidence).length > 0 ? (
                      <details className="mt-1 text-xs">
                        <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">
                          Evidence
                        </summary>
                        <pre className="mt-1 overflow-x-auto rounded bg-neutral-100 p-2 text-[11px] dark:bg-white/10">
                          {pretty(evidence)}
                        </pre>
                      </details>
                    ) : null}
                  </span>
                  {isOpenFlag(f) ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === f.id}
                        onClick={() => setConfirming(f)}
                        className={outlineBtn}
                      >
                        Confirm abuse
                      </button>
                      <button
                        type="button"
                        disabled={busyId === f.id}
                        onClick={() => decide(f, "dismiss")}
                        className={outlineBtn}
                      >
                        {busyId === f.id
                          ? "Working…"
                          : "Dismiss (false positive)"}
                      </button>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </DataState>
      </div>

      <ConfirmDialog
        open={!!confirming}
        danger
        title="Confirm this as abuse?"
        confirmLabel="Confirm abuse"
        busy={!!confirming && busyId === confirming.id}
        onConfirm={() => confirming && decide(confirming, "confirm")}
        onCancel={() => setConfirming(null)}
        message={
          <>
            {confirming?.nickname}&apos;s entries will stay off the
            leaderboards. Check the evidence first. If it&apos;s a false alarm,
            use Dismiss instead.
          </>
        }
      />
    </section>
  );
}

/* --------------------------------------------------------------------- Page */

export default function AdminGamification() {
  const [banner, setBanner] = useState<Banner>(null);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">
        Gamification
      </h1>

      {banner ? (
        <p
          role={banner.kind === "err" ? "alert" : "status"}
          className={
            "rounded-lg p-3 text-sm font-semibold " +
            (banner.kind === "ok"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800")
          }
        >
          {banner.kind === "ok" ? "✅" : "⛔"} {banner.msg}
        </p>
      ) : null}

      <XpRulesSection setBanner={setBanner} />
      <LevelsSection setBanner={setBanner} />
      <BadgesSection setBanner={setBanner} />

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">
          Leaderboard configuration
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            Scopes: weekly, monthly, all-time · national (state, school and
            subject boards share the same pipeline).
          </li>
          <li>
            Ranking basis: XP. Verified mock scores sit on a separate board so
            volume alone cannot win.
          </li>
          <li>Weekly reset: every Monday 00:00 WAT.</li>
          <li>
            Privacy: nickname and avatar only; minors never show personal data;
            students may opt out entirely.
          </li>
        </ul>
      </section>

      <IntegritySection setBanner={setBanner} />
    </div>
  );
}
