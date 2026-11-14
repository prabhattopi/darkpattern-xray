"use client";

import React, { useCallback, useState } from "react";
import {
  AlertCircle,
  FileText,
  RotateCcw,
  ScanEye,
  Shield,
  Sparkles,
} from "lucide-react";
import UploadZone from "@/components/UploadZone";
import XRayCanvas from "@/components/XRayCanvas";
import FindingsPanel from "@/components/FindingsPanel";
import ActionToolkit from "@/components/ActionToolkit";
import {
  ProcessedImagePayload,
  processUploadedFile,
  rasterizeSourceToPng,
} from "@/lib/imageUtils";
import { SAMPLE_SCENARIOS } from "@/lib/samples";
import { SampleScenario, XRayAnalysisReport } from "@/types/xray";

export default function HomePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [report, setReport] = useState<XRayAnalysisReport | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isNoticeDrawerOpen, setIsNoticeDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runForensicScan = useCallback(
    async (payload: ProcessedImagePayload) => {
      setImagePreview(payload.previewUrl);
      setReport(null);
      setSelectedPatternId(null);
      setIsNoticeDrawerOpen(false);
      setErrorMessage(null);
      setIsAnalyzing(true);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: payload.base64Data,
            mimeType: payload.mimeType,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.error || "Failed to analyze screenshot for dark patterns."
          );
        }

        setReport(data.report);
        setActiveModel(data.model || null);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unexpected error during X-Ray scan.";
        setErrorMessage(msg);
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const handleSelectFile = useCallback(
    async (file: File) => {
      try {
        const processed = await processUploadedFile(file);
        await runForensicScan(processed);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Could not read uploaded file."
        );
      }
    },
    [runForensicScan]
  );

  const handleSelectSample = useCallback(
    async (sample: SampleScenario) => {
      try {
        const processed = await rasterizeSourceToPng(sample.imagePath);
        await runForensicScan(processed);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Could not load sample scenario."
        );
      }
    },
    [runForensicScan]
  );

  const handleReset = () => {
    setImagePreview(null);
    setReport(null);
    setSelectedPatternId(null);
    setIsNoticeDrawerOpen(false);
    setErrorMessage(null);
    setActiveModel(null);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-lg shadow-rose-600/25">
              <ScanEye className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  DarkPattern <span className="text-rose-400">X-Ray</span>
                </h1>
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 ring-1 ring-rose-500/30">
                  AI Forensics
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Expose hidden subscription traps, drip pricing &amp; deceptive UI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeModel && (
              <span className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400 md:inline-flex">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {activeModel}
              </span>
            )}

            {/* Top Drawer Trigger Button for Consumer Defense & Cancellation Notice */}
            {report && (
              <button
                type="button"
                onClick={() => setIsNoticeDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Legal Cancellation Notice
              </button>
            )}

            {imagePreview && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white ring-1 ring-slate-700 hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                New Scan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold">X-Ray Scan Interrupted</p>
              <p className="mt-0.5 text-xs text-rose-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* State 1: Landing Upload & Sample Selector */}
        {!imagePreview ? (
          <div className="mx-auto max-w-4xl py-3">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300">
                <Shield className="h-3.5 w-3.5" />
                Consumer Protection &amp; Regulatory Audit Engine
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                See Every Hidden Trap Before You Click{" "}
                <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                  &ldquo;Subscribe&rdquo;
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
                Drop any checkout, pricing table, or cancellation screenshot.
                Multimodal Vision pins exact bounding boxes on deceptive
                patterns, calculates true hidden costs, and drafts an instant
                legal cancellation notice.
              </p>
            </div>

            <UploadZone
              onSelectFile={handleSelectFile}
              onSelectSample={handleSelectSample}
              isAnalyzing={isAnalyzing}
            />
          </div>
        ) : (
          /* State 2: Locked Left X-Ray Canvas + Independent Right Findings Scroll */
          <div className="space-y-4">
            {/* Quick Sample Switcher Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-2">
              <span className="text-xs font-semibold text-slate-400">
                Quick Switch Sample:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => handleSelectSample(s)}
                    className="rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-rose-500/50 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Split-Screen Forensics Grid */}
            <div className="grid items-start gap-6 lg:grid-cols-12">
              {/* Left 7 Columns: Locked Stationary X-Ray Visual Canvas */}
              <div className="lg:sticky lg:top-20 lg:col-span-7">
                <XRayCanvas
                  imageUrl={imagePreview}
                  patterns={report?.patterns || []}
                  selectedPatternId={selectedPatternId}
                  onSelectPattern={setSelectedPatternId}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              {/* Right 5 Columns: Independently Scrollable Findings Feed */}
              <div className="lg:col-span-5">
                {report ? (
                  <FindingsPanel
                    report={report}
                    selectedPatternId={selectedPatternId}
                    onSelectPattern={setSelectedPatternId}
                  />
                ) : (
                  <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <div className="h-6 w-40 animate-pulse rounded bg-slate-800" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-800" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 animate-pulse rounded-xl bg-slate-800" />
                      <div className="h-16 animate-pulse rounded-xl bg-slate-800" />
                      <div className="h-16 animate-pulse rounded-xl bg-slate-800" />
                    </div>
                    <div className="h-28 w-full animate-pulse rounded-xl bg-slate-800" />
                    <div className="h-28 w-full animate-pulse rounded-xl bg-slate-800" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-Over Drawer for Consumer Defense & Cancellation Notice */}
      {report && (
        <ActionToolkit
          report={report}
          isOpen={isNoticeDrawerOpen}
          onClose={() => setIsNoticeDrawerOpen(false)}
        />
      )}
    </div>
  );
}