"use client";

import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/api";
import { LoadingButton } from "@/components/loading";
import { useRefreshContent, type SetBanner } from "./hooks";

type Outcome = { dry: boolean; ok: boolean; message: string; raw: unknown };

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

function downloadTemplate(subjectName: string, topicTitle: string) {
  const header = "subject,topic,subtopic,stem,hint,explanation,difficulty,correct,option_a,option_b,option_c,option_d";
  // ASSUMPTION: subject and topic are matched by name, and correct is a letter. Confirm with the backend.
  const row = [subjectName, topicTitle, "", "What is 2 + 2?", "Count on your fingers.", "Two plus two equals four.", "easy", "B", "3", "4", "5", "22"]
    .map(csvCell)
    .join(",");
  const url = URL.createObjectURL(new Blob([`${header}\n${row}\n`], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkImport({ subjectName, firstTopicTitle, setBanner }: { subjectName: string; firstTopicTitle?: string; setBanner: SetBanner }) {
  const refresh = useRefreshContent();
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [busy, setBusy] = useState<"dry" | "real" | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [validatedSig, setValidatedSig] = useState<string | null>(null);

  const sig = file ? `${file.name}:${file.size}:${file.lastModified}` : null;
  const format = file?.name.toLowerCase().endsWith(".json") ? "json" : "csv";
  const canImport = !!file && validatedSig === sig;

  async function run(dryRun: boolean) {
    if (!file) return;
    setBusy(dryRun ? "dry" : "real");
    setBanner(null);
    const form = new FormData();
    form.append("file", file);
    form.append("format", format);
    form.append("dry_run", dryRun ? "true" : "false");
    try {
      const res = await api<unknown>("/api/v1/admin/questions/bulk-import/", { method: "POST", body: form });
      if (dryRun) {
        setValidatedSig(sig);
        setOutcome({ dry: true, ok: true, message: "The file passed validation. Nothing was created yet.", raw: res });
      } else {
        setOutcome({ dry: false, ok: true, message: "Import finished.", raw: res });
        setBanner({ kind: "ok", msg: "Questions imported" });
        setFile(null);
        setValidatedSig(null);
        setInputKey((k) => k + 1);
        await refresh();
      }
    } catch (e) {
      setOutcome({ dry: dryRun, ok: false, message: errorMessage(e), raw: e instanceof ApiError ? e.body : null });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card space-y-3 dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Bulk import (CSV / JSON)</h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">
        Upload a file, check it, then import. If any row is invalid nothing is created. The file names its own subject and topic on each row.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          key={inputKey}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setOutcome(null);
          }}
          className="text-sm"
          aria-label="Questions file"
        />
        <button type="button" onClick={() => downloadTemplate(subjectName, firstTopicTitle ?? "Topic name")} className="text-sm font-semibold text-navy-900 underline dark:text-gold-500">
          Download CSV template
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <LoadingButton type="button" loading={busy === "dry"} loadingText="Checking…" disabled={!file || busy !== null} onClick={() => run(true)} className="btn-navy">
          Validate file
        </LoadingButton>
        <LoadingButton type="button" loading={busy === "real"} loadingText="Importing…" disabled={!canImport || busy !== null} onClick={() => run(false)} className="btn-primary">
          Import questions
        </LoadingButton>
      </div>
      {file && !canImport ? <p className="text-xs text-neutral-500 dark:text-white/60">Validate the file first. Importing unlocks after it passes.</p> : null}

      {outcome ? (
        <div className={"rounded-lg p-3 text-sm " + (outcome.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900")} role={outcome.ok ? "status" : "alert"}>
          <p className="font-semibold">{outcome.ok ? "✅" : "⛔"} {outcome.message}</p>
          {outcome.raw ? (
            <details className="mt-1">
              <summary className="cursor-pointer text-xs font-semibold underline">Details from the server</summary>
              <pre className="mt-1 max-h-64 overflow-auto text-[11px]">{JSON.stringify(outcome.raw, null, 2)}</pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}