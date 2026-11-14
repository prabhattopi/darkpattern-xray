export interface ProcessedImagePayload {
  previewUrl: string;
  base64Data: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
}

const MAX_DIMENSION = 1600;

/**
 * Loads any image source (File, Blob, or SVG/PNG URL) into an offscreen HTML5 Canvas
 * and exports a clean, size-optimized PNG base64 string ready for Gemini Vision.
 */
export async function rasterizeSourceToPng(
  sourceUrl: string
): Promise<ProcessedImagePayload> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const naturalW = img.naturalWidth || 1200;
      const naturalH = img.naturalHeight || 800;

      const scale =
        naturalW > MAX_DIMENSION ? MAX_DIMENSION / naturalW : 1;
      const targetW = Math.round(naturalW * scale);
      const targetH = Math.round(naturalH * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not initialize 2D canvas context."));
        return;
      }

      // Fill solid white background first so transparent PNGs don't turn black
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const dataUrl = canvas.toDataURL("image/png");
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

      resolve({
        previewUrl: dataUrl,
        base64Data,
        mimeType: "image/png",
        width: targetW,
        height: targetH,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for X-Ray processing."));
    };

    img.src = sourceUrl;
  });
}

export async function processUploadedFile(
  file: File
): Promise<ProcessedImagePayload> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file (PNG, JPG, WebP, or SVG).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    return await rasterizeSourceToPng(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}