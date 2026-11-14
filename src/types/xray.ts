export type DarkPatternCategory =
  | "Drip Pricing"
  | "Sneak into Basket"
  | "Confirmshaming"
  | "Roach Motel"
  | "False Scarcity"
  | "Visual Misdirection"
  | "Forced Continuity"
  | "Trick Questions"
  | "Hidden Subscription";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

/**
 * Normalized bounding box coordinates on a 0-1000 scale:
 * [ymin, xmin, ymax, xmax]
 */
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedPattern {
  id: string;
  category: DarkPatternCategory;
  title: string;
  severity: SeverityLevel;
  confidence: number; // 0 to 100
  box: BoundingBox;
  quotedText: string;
  explanation: string;
  psychologicalTrigger: string;
  estimatedFinancialImpactUsd: number;
  legalReference: string;
}

export interface XRayAnalysisReport {
  productName: string;
  pageType: string;
  manipulationScore: number; // 0 (Clean) to 100 (Highly Manipulative)
  riskVerdict: "Safe" | "Caution" | "Deceptive" | "Predatory";
  advertisedPriceUsd: number;
  trueFirstYearCostUsd: number;
  hiddenCostUsd: number;
  summary: string;
  patterns: DetectedPattern[];
  cancellationNotice: {
    subjectLine: string;
    recipientRole: string;
    legalBasis: string;
    letterBody: string;
  };
}

export interface SampleScenario {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  imagePath: string;
  difficultyBadge: string;
  expectedTrapsCount: number;
}