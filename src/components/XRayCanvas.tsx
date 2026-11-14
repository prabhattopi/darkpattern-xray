"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ScanSearch, Sparkles } from "lucide-react";
import { DetectedPattern, SeverityLevel } from "@/types/xray";

interface XRayCanvasProps {
  imageUrl: string;
  patterns: DetectedPattern[];
  selectedPatternId: string | null;
  onSelectPattern: (id: string | null) => void;
  isAnalyzing: boolean;
}

const SEVERITY_STYLES: Record<
  SeverityLevel,
  { border: string; bg: string; badge: string; ring: string }
> = {
  critical: {
    border: "border-rose-500",
    bg: "bg-rose-500/20",
    badge: "bg-rose-600 text-white",
    ring: "ring-rose-400",
  },
  high: {
    border: "border-orange-500",
    bg: "bg-orange-500/20",
    badge: "bg-orange-600 text-white",
    ring: "ring-orange-400",
  },
  medium: {
    border: "border-amber-400",
    bg: "bg-amber-400/20",
    badge: "bg-amber-500 text-slate-950",
    ring: "ring-amber-300",
  },
  low: {
    border: "border-sky-400",
    bg: "bg-sky-400/20",
    badge: "bg-sky-500 text-slate-950",
    ring: "ring-sky-300",
  },
};

export default function XRayCanvas({
  imageUrl,
  patterns,
  selectedPatternId,
  onSelectPattern,
  isAnalyzing,
}: XRayCanvasProps) {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
      {/* Top Inspection Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <ScanSearch className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Visual X-Ray Overlay
          </span>
          {!isAnalyzing && (
            <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-300 ring-1 ring-rose-500/30">
              {patterns.length} {patterns.length === 1 ? "Trap" : "Traps"} Grounded
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedPatternId && (
            <button
              type="button"
              onClick={() => onSelectPattern(null)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Show All Boxes
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowOverlay((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700 transition-colors"
          >
            {showOverlay ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-rose-400" />
                Hide X-Ray Boxes
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                Show X-Ray Boxes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screenshot + Zero-Drift Bounding Box Container */}
      <div className="relative bg-slate-950 p-3 sm:p-4">
        <div className="relative mx-auto w-full overflow-hidden rounded-xl ring-1 ring-slate-800">
          {/* Base Image (w-full h-auto ensures 1:1 coordinate mapping) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Analyzed UI Screenshot"
            className={`block h-auto w-full select-none transition-all duration-300 ${
              showOverlay && patterns.length > 0 ? "brightness-90" : "brightness-100"
            }`}
          />

          {/* Scanning Pulse Overlay while Gemini Vision runs */}
          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-xs">
              <div className="flex items-center gap-2.5 rounded-full border border-rose-500/40 bg-slate-900/90 px-5 py-2.5 text-sm font-semibold text-rose-300 shadow-lg">
                <Sparkles className="h-4 w-4 animate-spin text-rose-400" />
                Running Gemini Vision Dark-Pattern X-Ray...
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Detecting hidden fees, pre-checked traps, and visual misdirection
              </p>
            </div>
          )}

          {/* Normalized [0-1000] Bounding Boxes */}
          {!isAnalyzing &&
            showOverlay &&
            patterns.map((pattern, index) => {
              const { ymin, xmin, ymax, xmax } = pattern.box;
              const top = `${ymin / 10}%`;
              const left = `${xmin / 10}%`;
              const width = `${Math.max(2, (xmax - xmin) / 10)}%`;
              const height = `${Math.max(2, (ymax - ymin) / 10)}%`;

              const style = SEVERITY_STYLES[pattern.severity] || SEVERITY_STYLES.high;
              const isSelected = selectedPatternId === pattern.id;
              const isDimmed = selectedPatternId !== null && !isSelected;

              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() =>
                    onSelectPattern(isSelected ? null : pattern.id)
                  }
                  style={{ top, left, width, height }}
                  title={`${pattern.category}: ${pattern.title}`}
                  className={`group absolute cursor-pointer rounded-md border-2 transition-all duration-150 focus:outline-none ${
                    style.border
                  } ${style.bg} ${
                    isSelected
                      ? `z-30 ring-4 ${style.ring} scale-[1.01] shadow-xl`
                      : isDimmed
                      ? "z-10 opacity-35 hover:opacity-90"
                      : "z-20 hover:z-30 hover:ring-2 hover:ring-white/80"
                  }`}
                >
                  {/* Floating Number & Category Tag */}
                  <span
                    className={`absolute -top-6 left-0 inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-md ${style.badge}`}
                  >
                    #{index + 1} {pattern.category}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}