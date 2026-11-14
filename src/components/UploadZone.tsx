"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  ShieldAlert,
  ClipboardPaste,
  FileImage,
  ArrowRight,
} from "lucide-react";
import { SAMPLE_SCENARIOS } from "@/lib/samples";
import { SampleScenario } from "@/types/xray";

interface UploadZoneProps {
  onSelectFile: (file: File) => void;
  onSelectSample: (sample: SampleScenario) => void;
  isAnalyzing: boolean;
}

export default function UploadZone({
  onSelectFile,
  onSelectSample,
  isAnalyzing,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (isAnalyzing) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        onSelectFile(file);
      }
    },
    [isAnalyzing, onSelectFile]
  );

  // Global Ctrl+V / Cmd+V screenshot paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isAnalyzing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            onSelectFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isAnalyzing, onSelectFile]);

  return (
    <div className="space-y-8">
      {/* Main Upload / Dropzone Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
          isDragging
            ? "border-rose-500 bg-rose-500/10 scale-[1.01]"
            : "border-slate-700 bg-slate-900/60 hover:border-rose-400/70 hover:bg-slate-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelectFile(file);
            e.target.value = "";
          }}
        />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 transition-transform group-hover:scale-110">
          <Upload className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-bold text-white">
          Drop a Checkout, Pricing, or Cancellation Screenshot
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          Upload any PNG, JPG, or WebP screenshot — or press{" "}
          <kbd className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-200 ring-1 ring-slate-700">
            Ctrl + V
          </kbd>{" "}
          anywhere to paste directly from your clipboard.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 ring-1 ring-slate-700">
            <FileImage className="h-3.5 w-3.5 text-sky-400" />
            PNG / JPG / WebP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 ring-1 ring-slate-700">
            <ClipboardPaste className="h-3.5 w-3.5 text-emerald-400" />
            Clipboard Paste Ready
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 ring-1 ring-slate-700">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            FTC &amp; EU DSA Forensics
          </span>
        </div>
      </div>

      {/* 1-Click Sample Cases for Instant Testing */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Or Test With 1-Click Live Trap Scenarios
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Instant interactive demo
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SAMPLE_SCENARIOS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isAnalyzing}
              onClick={() => onSelectSample(sample)}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 text-left transition-all hover:border-rose-500/60 hover:bg-slate-900 hover:shadow-lg hover:shadow-rose-950/20 disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/30">
                    {sample.difficultyBadge}
                  </span>
                  <span className="text-xs text-slate-500">
                    {sample.industry}
                  </span>
                </div>

                <h4 className="mt-3 text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  {sample.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {sample.subtitle}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-semibold text-rose-400">
                <span>Run X-Ray Scan (~{sample.expectedTrapsCount} traps)</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}