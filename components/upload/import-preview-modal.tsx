"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Download, X } from "lucide-react";
import type { ParsedSheet } from "@/types/dashboard";

type ImportPreviewModalProps = {
  open: boolean;
  sheets: ParsedSheet[];
  autoFixApplied: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onAutoFix: () => void;
  onExportErrors: () => void;
};

export function ImportPreviewModal({ open, sheets, autoFixApplied, onClose, onConfirm, onAutoFix, onExportErrors }: ImportPreviewModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedSheet = sheets[selectedIndex] ?? sheets[0];

  const summary = useMemo(() => {
    return sheets.reduce(
      (acc, sheet) => {
        const counts = sheet.summaryCounts;
        if (!counts) return acc;
        acc.totalRows += counts.totalRows;
        acc.importedRows += counts.importedRows;
        acc.fixedRows += counts.fixedRows;
        acc.warningRows += counts.warningRows;
        acc.rejectedRows += counts.rejectedRows;
        return acc;
      },
      { totalRows: 0, importedRows: 0, fixedRows: 0, warningRows: 0, rejectedRows: 0 }
    );
  }, [sheets]);

  const columnMapping = useMemo(() => {
    if (!selectedSheet) return [];
    return Object.entries(selectedSheet.mapping).filter(([key, value]) => key !== "confidence" && value);
  }, [selectedSheet]);

  if (!open || !selectedSheet) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/40 backdrop-blur-sm p-4">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--border))] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ocean">Import preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">Review your pharma ETL upload</h2>
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">Preview the first 20 rows, mappings, validation flags, and auto-fix suggestions before final import.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Import summary</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Total rows", summary.totalRows],
                  ["Imported", summary.importedRows],
                  ["Fixed", summary.fixedRows],
                  ["Warnings", summary.warningRows],
                  ["Rejected", summary.rejectedRows]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-3 text-sm">
                    <p className="text-[rgb(var(--muted))]">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Sheets</p>
              <div className="mt-3 space-y-2">
                {sheets.map((sheet, index) => (
                  <button
                    key={`${sheet.fileName}-${sheet.sheetName}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedIndex === index ? "border-ocean bg-ocean/5" : "border-transparent bg-[rgb(var(--panel))] hover:border-[rgb(var(--border))]"}`}
                  >
                    <p className="font-semibold text-[rgb(var(--text))]">{sheet.sheetName}</p>
                    <p className="mt-1 text-xs text-[rgb(var(--muted))]">{sheet.rowCount} rows • {sheet.mapping.confidence}% mapped</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Mapping preview</p>
              <div className="mt-3 space-y-2">
                {columnMapping.length ? columnMapping.map(([field, column]) => (
                  <div key={field} className="flex items-center justify-between gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm">
                    <span className="font-medium text-[rgb(var(--text))]">{field}</span>
                    <span className="text-[rgb(var(--muted))]">{column}</span>
                  </div>
                )) : <p className="text-sm text-[rgb(var(--muted))]">No mapped fields detected.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Sheet details</p>
                <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
                  <p><span className="font-semibold text-[rgb(var(--text))]">Sheet:</span> {selectedSheet.sheetName}</p>
                  <p><span className="font-semibold text-[rgb(var(--text))]">File:</span> {selectedSheet.fileName}</p>
                  <p><span className="font-semibold text-[rgb(var(--text))]">Rows:</span> {selectedSheet.rowCount}</p>
                  <p><span className="font-semibold text-[rgb(var(--text))]">Status:</span> {selectedSheet.errors.length ? "Review errors" : "Ready to import"}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 text-sm shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Warnings</p>
                <div className="mt-3 space-y-2 text-sm text-[rgb(var(--muted))]">
                  {selectedSheet.warnings.length ? selectedSheet.warnings.map((warning) => (
                    <p key={warning} className="rounded-2xl bg-warning/10 px-3 py-2 text-warning">{warning}</p>
                  )) : <p className="text-[rgb(var(--muted))]">No warnings detected.</p>}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Preview rows</p>
                  <p className="mt-1 text-sm text-[rgb(var(--muted))]">First 20 rows show raw source values and cleaned output.</p>
                </div>
                <span className="rounded-full bg-slate-950/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">{selectedSheet.previewRows?.length ?? 0} rows</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-3xl border border-[rgb(var(--border))]">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-sm text-[rgb(var(--text))]">
                    <thead className="bg-[rgb(var(--panel))] text-left text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                      <tr>
                        <th className="px-3 py-3">Row</th>
                        <th className="px-3 py-3">Source</th>
                        <th className="px-3 py-3">Cleaned</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSheet.previewRows?.slice(0, 10).map((row) => (
                        <tr key={row.rowNumber} className="border-t border-[rgb(var(--border))]">
                          <td className="px-3 py-3 font-semibold text-[rgb(var(--text))]">{row.rowNumber}</td>
                          <td className="px-3 py-3 max-w-[240px] truncate text-[rgb(var(--muted))]">{Object.values(row.original).slice(0, 1).join(", ")}</td>
                          <td className="px-3 py-3 max-w-[240px] truncate text-[rgb(var(--muted))]">{Object.values(row.cleaned).slice(0, 1).join(", ")}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${row.status === "ok" ? "bg-mint/10 text-mint" : row.status === "warning" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean">Row-level issues</p>
                  <p className="mt-1 text-sm text-[rgb(var(--muted))]">Inspect invalid values, expected types and suggested fixes.</p>
                </div>
                <button
                  type="button"
                  onClick={onExportErrors}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--panel-soft))]"
                >
                  <Download className="h-4 w-4" />
                  Export errors
                </button>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
                {selectedSheet.rowIssues?.length ? selectedSheet.rowIssues.slice(0, 8).map((issue, index) => (
                  <div key={`${issue.rowId}-${index}`} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[rgb(var(--text))]">Row {issue.rowIndex + 2} • {issue.field}</p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${issue.severity === "critical" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-2">{issue.issue}</p>
                    <p className="mt-1 text-xs text-[rgb(var(--muted))]">Value: {issue.originalValue} · Expected: {issue.expectedType}</p>
                    <p className="mt-1 text-xs text-slate-500">Suggested fix: {issue.suggestedFix}</p>
                  </div>
                )) : <p className="text-[rgb(var(--muted))]">No row-level issues detected.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[rgb(var(--border))] px-6 py-5">
          <button
            type="button"
            onClick={onAutoFix}
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 text-sm font-semibold transition hover:bg-[rgb(var(--panel-soft))]"
          >
            <ArrowRight className="h-4 w-4" />
            {autoFixApplied ? "Auto-fixes applied" : "Fix automatically"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-ocean/20 transition hover:bg-aqua"
          >
            <CheckCircle2 className="h-4 w-4" />
            Import now
          </button>
        </div>
      </div>
    </div>
  );
}
