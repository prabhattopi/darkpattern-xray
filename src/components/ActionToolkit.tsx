"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { XRayAnalysisReport } from "@/types/xray";

interface ActionToolkitProps {
  report: XRayAnalysisReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionToolkit({
  report,
  isOpen,
  onClose,
}: ActionToolkitProps) {
  const [copied, setCopied] = useState(false);
  const [letterText, setLetterText] = useState(
    report.cancellationNotice.letterBody
  );

  // Sync letter text whenever a new report arrives
  useEffect(() => {
    setLetterText(report.cancellationNotice.letterBody);
    setCopied(false);
  }, [report]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${report.cancellationNotice.subjectLine}\n\n${letterText}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Clipboard permission blocked. Please select and copy manually.");
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = report.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `darkpattern-xray-${slug || "audit"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    report.cancellationNotice.subjectLine
  )}&body=${encodeURIComponent(letterText)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Over Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Consumer Defense and Cancellation Notice"
        className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-slate-900 shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Consumer Defense &amp; Cancellation Notice
              </h3>
              <p className="text-xs text-slate-400">
                Citing {report.cancellationNotice.legalBasis}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="xray-scroll flex-1 space-y-4 overflow-y-auto p-6">
          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyLetter}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied Notice!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Full Notice
                </>
              )}
            </button>

            <a
              href={mailtoHref}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700 transition-colors"
            >
              <Mail className="h-4 w-4 text-sky-400" />
              Open in Email App
            </a>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-4 w-4 text-amber-400" />
              Export Audit JSON
            </button>
          </div>

          {/* Recipient & Subject Metadata */}
          <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
            <div>
              <span className="font-semibold text-slate-400">Recipient: </span>
              <span className="text-slate-200">
                {report.cancellationNotice.recipientRole}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Subject: </span>
              <span className="font-semibold text-emerald-300">
                {report.cancellationNotice.subjectLine}
              </span>
            </div>
          </div>

          {/* Editable Legal Letter */}
          <div>
            <label
              htmlFor="legal-notice-editor"
              className="mb-2 block text-xs font-semibold text-slate-300"
            >
              Editable Legal Dispute / Cancellation Draft
            </label>
            <textarea
              id="legal-notice-editor"
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              rows={14}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-3.5 py-2.5 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              Edit placeholders like <strong>[Your Name]</strong> or{" "}
              <strong>[Account Email]</strong> directly above before copying or
              sending.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}