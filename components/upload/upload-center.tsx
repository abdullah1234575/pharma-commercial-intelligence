"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet, RotateCw, Trash2 } from "lucide-react";
import { parseCommercialFile } from "@/lib/data-mapping";
import { templateDefinitions } from "@/lib/template-definitions";
import type { ParsedSheet, PharmaRecord, UploadHistoryItem } from "@/types/dashboard";

type UploadCenterProps = {
  history: UploadHistoryItem[];
  onProcessed: (records: PharmaRecord[], sheets: ParsedSheet[], historyItem: UploadHistoryItem) => void;
  onDelete?: (itemId: string) => void;
};

export function UploadCenter({ history, onProcessed, onDelete }: UploadCenterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastFiles, setLastFiles] = useState<File[]>([]);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [displayHistory, setDisplayHistory] = useState<UploadHistoryItem[]>(history);

  useEffect(() => {
    setDisplayHistory(history);
  }, [history]);

  async function processFiles(files: File[]) {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress(8);
    setError(null);
    setLastFiles(files);

    try {
      const parsed: ParsedSheet[] = [];
      for (const [index, file] of files.entries()) {
        setProgress(Math.round(((index + 0.35) / files.length) * 100));
        parsed.push(...(await parseCommercialFile(file)));
        setProgress(Math.round(((index + 1) / files.length) * 100));
      }

      const blockingErrors = parsed.flatMap((sheet) => sheet.errors);
      const records = blockingErrors.length ? [] : parsed.flatMap((sheet) => sheet.records);
      const item: UploadHistoryItem = {
        id: crypto.randomUUID(),
        fileName: files.map((file) => file.name).join(", "),
        sheets: parsed.length,
        rows: records.length,
        status: records.length > 0 ? "processed" : "failed",
        createdAt: new Date().toISOString(),
        message: blockingErrors.length ? "Template validation failed. Review correction guidance." : "Upload processed successfully."
      };

      setSheets(parsed);
      onProcessed(records, parsed, item);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
      onProcessed([], [], {
        id: crypto.randomUUID(),
        fileName: files.map((file) => file.name).join(", "),
        sheets: 0,
        rows: 0,
        status: "failed",
        createdAt: new Date().toISOString(),
        message
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }

  function handleFiles(fileList: FileList | null) {
    void processFiles(Array.from(fileList ?? []));
  }

  function handleDeleteHistory(itemId: string) {
    setDisplayHistory((current) => current.filter((item) => item.id !== itemId));
    onDelete?.(itemId);
  }

  return (
    <section className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark">
      <input ref={inputRef} hidden multiple type="file" accept=".csv,.xls,.xlsx" onChange={(event) => handleFiles(event.target.files)} />
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">Tenant Data Upload</p>
          <p className="mt-1 truncate text-sm text-[rgb(var(--muted))] sm:max-w-xl">
            Upload Excel or CSV files to map multi-sheet commercial data into your private analytics workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-aqua"
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Upload
          </button>
          <details className="group relative w-full sm:w-auto">
            <summary className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 text-sm font-medium transition hover:border-ocean hover:text-ocean sm:w-auto">
              <FileSpreadsheet className="h-4 w-4" />
              Templates
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 shadow-executive dark:shadow-executive-dark sm:w-64">
              {templateDefinitions.map((template) => (
                <a
                  key={template.type}
                  className="block rounded-md px-3 py-2 text-sm transition hover:bg-[rgb(var(--panel-soft))] hover:text-ocean"
                  href={template.href}
                  download={template.fileName}
                >
                  {template.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          {isProcessing || progress > 0 ? (
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-sm text-[rgb(var(--text))]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[rgb(var(--text))]">{isProcessing ? "Processing upload" : "Last upload"}</p>
                <span className="text-xs text-[rgb(var(--muted))]">{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgb(var(--panel-soft))]">
                <div className="h-2 rounded-full bg-ocean transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-[rgb(var(--muted))]">
          <span className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2">{displayHistory.length} history entries</span>
          <span className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2">{sheets.length ? `${sheets.length} sheet(s) processed` : "Ready to upload"}</span>
        </div>
      </div>

      {isProcessing || progress > 0 ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-semibold text-[rgb(var(--muted))]">
            <span>{isProcessing ? "Processing upload" : "Last upload"}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[rgb(var(--panel-soft))]">
            <div className="h-2 rounded-full bg-ocean transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button className="inline-flex items-center gap-2 font-semibold" onClick={() => void processFiles(lastFiles)}>
            <RotateCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : null}

      {sheets.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sheets.map((sheet) => (
            <div key={`${sheet.fileName}-${sheet.sheetName}`} className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold">{sheet.sheetName}</p>
                <span className="rounded-md bg-ocean/10 px-2 py-1 text-xs font-semibold text-ocean">{sheet.mapping.confidence}% mapped</span>
              </div>
              <p className="mt-1 text-xs text-[rgb(var(--muted))]">{sheet.rowCount} source rows, {sheet.records.length} processed rows</p>
              {sheet.warnings.map((warning) => (
                <p key={warning} className="mt-2 text-xs leading-5 text-signal">{warning}</p>
              ))}
              {sheet.errors.map((sheetError) => (
                <p key={sheetError} className="mt-2 text-xs leading-5 text-danger">{sheetError}</p>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold">Upload History</h3>
        <div className="space-y-2">
          {displayHistory.slice(0, 4).map((item) => (
            <div key={item.id} className="grid gap-3 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {item.status === "processed" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-mint" /> : <AlertCircle className="h-4 w-4 shrink-0 text-danger" />}
                  <p className="truncate font-semibold">{item.fileName}</p>
                </div>
                <p className="mt-1 text-xs text-[rgb(var(--muted))]">{item.sheets} sheets | {item.rows} rows | {item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteHistory(item.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-danger transition hover:bg-danger/15 focus:outline-none focus:ring-2 focus:ring-danger/30"
                aria-label={`Delete ${item.fileName}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!history.length ? <p className="text-sm text-[rgb(var(--muted))]">No uploads yet.</p> : null}
        </div>
      </div>
    </section>
  );
}
