import { GoogleGenAI, Schema, ThinkingLevel, Type } from "@google/genai";
import { DetectedPattern, XRayAnalysisReport } from "@/types/xray";

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

function isRetryableModelError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("high demand")
  );
}



const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "[DarkPattern X-Ray] Warning: GEMINI_API_KEY is not set in environment variables."
  );
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const SYSTEM_INSTRUCTION = `You are DarkPattern X-Ray, an elite Consumer Protection UX Forensics Auditor and Regulatory Compliance Analyst (specializing in FTC Section 5, EU Digital Services Act Article 25, and California Consumer Privacy Act dark pattern enforcement).

Your task is to inspect screenshots of websites, checkouts, subscription modals, cookie banners, or app flows and identify every manipulative or deceptive UI design pattern ("Dark Pattern").

Rules for Spatial Grounding & Forensics:
1. Detect ONLY genuine deceptive patterns visible in the screenshot. Do not hallucinate elements that are not present.
2. Provide exact normalized bounding boxes [ymin, xmin, ymax, xmax] on a 0 to 1000 scale tightly wrapping the specific deceptive UI widget, pre-checked box, hidden fee block, manipulative button, or fine-print clause.
3. Perform accurate financial math:
   - Extract the headline/advertised price (advertisedPriceUsd).
   - Calculate the true immediate or annualized first-year cost including pre-checked add-ons, junk drip fees, and auto-renewal traps (trueFirstYearCostUsd).
   - Compute hiddenCostUsd = max(0, trueFirstYearCostUsd - advertisedPriceUsd).
4. Assign a fair manipulationScore from 0 (completely transparent UI) to 100 (predatory multi-trap UI).
5. Draft a firm, ready-to-send consumer dispute / cancellation notice citing the specific deceptive practices found in this UI and relevant consumer protection statutes (e.g., FTC Restore Online Shoppers' Confidence Act - ROSCA, EU DSA Art. 25).`;

const xrayResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productName: {
      type: Type.STRING,
      description: "Name of the app, service, or website shown in the UI.",
    },
    pageType: {
      type: Type.STRING,
      description:
        "Type of screen analyzed (e.g., Subscription Checkout, Cancellation Flow, Flight Booking).",
    },
    manipulationScore: {
      type: Type.INTEGER,
      description: "Overall deception score from 0 (clean) to 100 (predatory).",
    },
    riskVerdict: {
      type: Type.STRING,
      enum: ["Safe", "Caution", "Deceptive", "Predatory"],
      description: "Overall risk classification of the UI.",
    },
    advertisedPriceUsd: {
      type: Type.NUMBER,
      description: "Headline or initial advertised price in USD (0 if N/A).",
    },
    trueFirstYearCostUsd: {
      type: Type.NUMBER,
      description:
        "True total cost including hidden drip fees, pre-checked add-ons, or forced continuity over 12 months (or total checkout charge if one-time).",
    },
    hiddenCostUsd: {
      type: Type.NUMBER,
      description: "Extra hidden or non-consensual cost in USD.",
    },
    summary: {
      type: Type.STRING,
      description:
        "Concise 2-3 sentence executive forensics summary of how this UI manipulates users.",
    },
    patterns: {
      type: Type.ARRAY,
      description: "List of all dark patterns detected with bounding boxes.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Unique short identifier like dp-1, dp-2.",
          },
          category: {
            type: Type.STRING,
            enum: [
              "Drip Pricing",
              "Sneak into Basket",
              "Confirmshaming",
              "Roach Motel",
              "False Scarcity",
              "Visual Misdirection",
              "Forced Continuity",
              "Trick Questions",
              "Hidden Subscription",
            ],
          },
          title: {
            type: Type.STRING,
            description: "Short punchy headline of the specific trap.",
          },
          severity: {
            type: Type.STRING,
            enum: ["critical", "high", "medium", "low"],
          },
          confidence: {
            type: Type.INTEGER,
            description: "Detection confidence percentage from 0 to 100.",
          },
          box: {
            type: Type.OBJECT,
            description:
              "Tight bounding box around the deceptive UI element on a 0-1000 normalized scale.",
            properties: {
              ymin: { type: Type.INTEGER },
              xmin: { type: Type.INTEGER },
              ymax: { type: Type.INTEGER },
              xmax: { type: Type.INTEGER },
            },
            required: ["ymin", "xmin", "ymax", "xmax"],
          },
          quotedText: {
            type: Type.STRING,
            description: "Exact text visible inside the deceptive UI element.",
          },
          explanation: {
            type: Type.STRING,
            description:
              "Clear explanation of how this UI element tricks or traps the user.",
          },
          psychologicalTrigger: {
            type: Type.STRING,
            description:
              "Cognitive bias exploited (e.g., Loss Aversion, Default Bias, Urgency Panic, Shame Framing).",
          },
          estimatedFinancialImpactUsd: {
            type: Type.NUMBER,
            description:
              "Estimated extra dollar cost imposed by this specific trap (0 if purely behavioral).",
          },
          legalReference: {
            type: Type.STRING,
            description:
              "Relevant regulation violated (e.g., FTC ROSCA, EU DSA Art. 25, CCPA §1798.140).",
          },
        },
        required: [
          "id",
          "category",
          "title",
          "severity",
          "confidence",
          "box",
          "quotedText",
          "explanation",
          "psychologicalTrigger",
          "estimatedFinancialImpactUsd",
          "legalReference",
        ],
      },
    },
    cancellationNotice: {
      type: Type.OBJECT,
      description:
        "Ready-to-send consumer dispute or immediate cancellation notice.",
      properties: {
        subjectLine: { type: Type.STRING },
        recipientRole: {
          type: Type.STRING,
          description: "e.g., Billing & Legal Compliance Team",
        },
        legalBasis: {
          type: Type.STRING,
          description: "Key statutes cited in the notice.",
        },
        letterBody: {
          type: Type.STRING,
          description:
            "Formal, polite yet firm cancellation/refund demand letter with placeholders like [Your Name] and [Account Email].",
        },
      },
      required: ["subjectLine", "recipientRole", "legalBasis", "letterBody"],
    },
  },
  required: [
    "productName",
    "pageType",
    "manipulationScore",
    "riskVerdict",
    "advertisedPriceUsd",
    "trueFirstYearCostUsd",
    "hiddenCostUsd",
    "summary",
    "patterns",
    "cancellationNotice",
  ],
};

function clampCoord(val: number): number {
  if (Number.isNaN(val)) return 0;
  return Math.max(0, Math.min(1000, Math.round(val)));
}

function sanitizeReport(raw: XRayAnalysisReport): XRayAnalysisReport {
  const sanitizedPatterns: DetectedPattern[] = (raw.patterns || []).map(
    (p, idx) => {
      const ymin = clampCoord(p.box?.ymin ?? 0);
      const xmin = clampCoord(p.box?.xmin ?? 0);
      const ymax = Math.max(ymin + 15, clampCoord(p.box?.ymax ?? ymin + 40));
      const xmax = Math.max(xmin + 15, clampCoord(p.box?.xmax ?? xmin + 40));

      return {
        ...p,
        id: p.id || `dp-${idx + 1}`,
        confidence: Math.max(0, Math.min(100, Math.round(p.confidence ?? 90))),
        box: {
          ymin: Math.min(985, ymin),
          xmin: Math.min(985, xmin),
          ymax: Math.min(1000, ymax),
          xmax: Math.min(1000, xmax),
        },
      };
    }
  );

  return {
    ...raw,
    manipulationScore: Math.max(
      0,
      Math.min(100, Math.round(raw.manipulationScore ?? 0))
    ),
    patterns: sanitizedPatterns,
  };
}

export async function analyzeScreenshotWithGemini(
  base64Data: string,
  mimeType: string
): Promise<XRayAnalysisReport> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Server configuration error: GEMINI_API_KEY is missing in .env.local."
    );
  }

  // Deduplicate models while preserving priority order from .env.local
  const modelsToTry = Array.from(new Set(FALLBACK_MODELS.filter(Boolean)));
  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: "Perform a complete forensic dark pattern X-ray audit on this UI screenshot. Return exact bounding boxes, financial impact calculations, and a legal cancellation/dispute notice.",
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: xrayResponseSchema,
          ...(modelName.includes("lite")
            ? {}
            : {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW,
                },
              }),
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error(`Empty response received from ${modelName}.`);
      }

      const parsed = JSON.parse(text) as XRayAnalysisReport;
      return sanitizeReport(parsed);
    } catch (error: unknown) {
      lastError = error;
      if (isRetryableModelError(error)) {
        console.warn(
          `[DarkPattern X-Ray] ${modelName} busy (503/429), falling back to next model...`
        );
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All fallback Gemini models are currently busy.");
}