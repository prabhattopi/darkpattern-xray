"use client";

import React, { useEffect, useRef } from "react";
import {
  AlertTriangle,
  Brain,
  DollarSign,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  DetectedPattern,
  SeverityLevel,
  XRayAnalysisReport,
} from "@/types/xray";

interface FindingsPanelProps {
  report: XRayAnalysisReport;
  selectedPatternId: string | null;
  onSelectPattern: (id: string | null) => void;
}

const VERDICT_CONFIG: Record<
  XRayAnalysisReport["riskVerdict"],
  { badge: string; bar: string; text: string }
> = {
  Safe: {
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    bar: "bg-emerald-500",
    text: "text-emerald-400",
  },
  Caution: {
    badge: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    bar: "bg-amber-500",
    text: "text-amber-400",
  },
  Deceptive: {
    badge: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
    bar: "bg-orange-500",
    text: "text-orange-400",
  },
  Predatory: {
    badge: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    bar: "bg-rose-500",
    text: "text-rose-400",
  },
};

const SEVERITY_BADGE: Record<SeverityLevel, string> = {
  critical: "bg-rose-500/20 text-rose-300 ring-rose-500/40",
  high: "bg-orange-500/20 text-orange-300 ring-orange-500/40",
  medium: "bg-amber-500/20 text-amber-300 ring-amber-500/40",
  low: "bg-sky-500/20 text-sky-300 ring-sky-500/40",
};

export default function FindingsPanel({
  report,
  selectedPatternId,
  onSelectPattern,
}: FindingsPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll ONLY the right-side findings container so the left X-Ray image stays locked in place
  useEffect(() => {
    if (!selectedPatternId) return;
    const container = scrollContainerRef.current;
    const card = cardRefs.current[selectedPatternId];

    if (container && card) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetScrollTop =
        cardRect.top - containerRect.top + container.scrollTop - 12;

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    }
  }, [selectedPatternId]);

  const verdictStyle =
    VERDICT_CONFIG[report.riskVerdict] || VERDICT_CONFIG.Deceptive;

  return (
    <div
      ref={scrollContainerRef}
      className="xray-scroll space-y-5 lg:max-h-[calc(100vh-8.75rem)] lg:overflow-y-auto lg:pr-2"
    >
      {/* Executive Score & Financial Trap Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {report.pageType}
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold text-white">
              {report.productName}
            </h2>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${verdictStyle.badge}`}
          >
            {report.riskVerdict === "Safe" ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            {report.riskVerdict} UI
          </span>
        </div>

        {/* Manipulation Index Meter */}
        <div className="mt-5">
          <div className="flex items-end justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Manipulation Severity Index
            </span>
            <span className={`text-lg font-black ${verdictStyle.text}`}>
              {report.manipulationScore}
              <span className="text-xs font-normal text-slate-500">/100</span>
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${verdictStyle.bar}`}
              style={{ width: `${report.manipulationScore}%` }}
            />
          </div>
        </div>

        {/* Advertised vs True Cost Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
              Advertised
            </div>
            <p className="mt-1 text-base font-extrabold text-slate-200">
              ${report.advertisedPriceUsd.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              True Cost
            </div>
            <p className="mt-1 text-base font-extrabold text-white">
              ${report.trueFirstYearCostUsd.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              Hidden Trap
            </div>
            <p className="mt-1 text-base font-black text-rose-400">
              +${report.hiddenCostUsd.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-300">
          {report.summary}
        </p>
      </div>

      {/* Detected Dark Patterns List */}
      <div className="space-y-3 pb-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Forensic Evidence ({report.patterns.length} Detected)
          </h3>
          <span className="text-[11px] text-slate-500">
            Click card to highlight on image
          </span>
        </div>

        {report.patterns.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-2 text-sm font-bold text-emerald-300">
              No Manipulative Dark Patterns Found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Pricing and user choices appear transparent in this screenshot.
            </p>
          </div>
        ) : (
          report.patterns.map((pattern: DetectedPattern, index: number) => {
            const isSelected = selectedPatternId === pattern.id;

            return (
              <div
                key={pattern.id}
                ref={(el) => {
                  cardRefs.current[pattern.id] = el;
                }}
                onClick={() =>
                  onSelectPattern(isSelected ? null : pattern.id)
                }
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                  isSelected
                    ? "border-rose-500 bg-slate-900 ring-2 ring-rose-500/40 shadow-lg"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-600 text-[11px] font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-rose-300">
                      {pattern.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {pattern.estimatedFinancialImpactUsd > 0 && (
                      <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-300">
                        +${pattern.estimatedFinancialImpactUsd.toFixed(2)}
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                        SEVERITY_BADGE[pattern.severity] || SEVERITY_BADGE.high
                      }`}
                    >
                      {pattern.severity}
                    </span>
                  </div>
                </div>

                <h4 className="mt-2 text-sm font-bold text-white">
                  {pattern.title}
                </h4>

                {pattern.quotedText && pattern.quotedText !== "N/A" && (
                  <blockquote className="mt-2 border-l-2 border-slate-700 pl-2.5 text-[11px] italic text-slate-400">
                    &ldquo;{pattern.quotedText}&rdquo;
                  </blockquote>
                )}

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {pattern.explanation}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-800/90 px-2 py-0.5 text-purple-300">
                    <Brain className="h-3 w-3" />
                    {pattern.psychologicalTrigger}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-slate-800/90 px-2 py-0.5 text-sky-300">
                    <Scale className="h-3 w-3" />
                    {pattern.legalReference}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}