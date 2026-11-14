import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeScreenshotWithGemini } from "@/lib/gemini";

const AnalyzeRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(50, "Image payload is too small or empty.")
    .max(12_000_000, "Image exceeds 8MB limit. Please upload a smaller screenshot."),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"], {
    message: "Unsupported image format. Please use PNG, JPEG, or WebP.",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = AnalyzeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    // Strip optional data URL prefix if present (e.g., "data:image/png;base64,...")
    const cleanBase64 = validation.data.imageBase64.replace(
      /^data:image\/[a-zA-Z+]+;base64,/,
      ""
    );

    const report = await analyzeScreenshotWithGemini(
      cleanBase64,
      validation.data.mimeType
    );

    return NextResponse.json({
      success: true,
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      report,
    });
  } catch (error: unknown) {
    console.error("[/api/analyze] Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error during dark pattern analysis.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}