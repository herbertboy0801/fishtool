// Canvas-based image processing utilities

export interface CompressOptions {
  quality: number; // 0-1
  format: "jpeg" | "png" | "webp";
  maxWidth?: number;
}

export interface EnhanceOptions {
  sharpness: number; // 0-100
  contrast: number; // 0-100
  saturation: number; // 0-100
  brightness: number; // 0-100
}

export interface FilterPreset {
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
}

export const filterPresets: FilterPreset[] = [
  { name: "原图", brightness: 0, contrast: 0, saturation: 0 },
  { name: "清新", brightness: 5, contrast: 5, saturation: 15 },
  { name: "暖阳", brightness: 10, contrast: 5, saturation: 10 },
  { name: "冷调", brightness: 0, contrast: 10, saturation: -15 },
  { name: "复古", brightness: -5, contrast: 15, saturation: -20 },
  { name: "黑白", brightness: 0, contrast: 10, saturation: -100 },
  { name: "粉嫩", brightness: 10, contrast: -5, saturation: 20 },
  { name: "胶片", brightness: -5, contrast: 20, saturation: -10 },
  { name: "鲜艳", brightness: 5, contrast: 10, saturation: 30 },
  { name: "柔和", brightness: 10, contrast: -10, saturation: -5 },
];

export const enhancePresets = [
  { name: "自然清晰", sharpness: 30, contrast: 10, saturation: 5, brightness: 5 },
  { name: "通透质感", sharpness: 20, contrast: 20, saturation: 10, brightness: 10 },
  { name: "高清锐化", sharpness: 60, contrast: 15, saturation: 0, brightness: 0 },
  { name: "商品模式", sharpness: 40, contrast: 15, saturation: 15, brightness: 10 },
  { name: "人像美颜", sharpness: 10, contrast: 5, saturation: 10, brightness: 15 },
  { name: "暗光增强", sharpness: 20, contrast: 25, saturation: 5, brightness: 30 },
];

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(
  img: HTMLImageElement,
  options: CompressOptions
): { dataUrl: string; size: number } {
  const canvas = document.createElement("canvas");
  let { width, height } = img;

  if (options.maxWidth && width > options.maxWidth) {
    height = (options.maxWidth / width) * height;
    width = options.maxWidth;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const mimeType = `image/${options.format}`;
  const dataUrl = canvas.toDataURL(mimeType, options.quality);
  const size = Math.round((dataUrl.length * 3) / 4);

  return { dataUrl, size };
}

export function applyEnhance(
  img: HTMLImageElement,
  options: EnhanceOptions
): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Brightness adjustment (-100 to 100 → -255 to 255)
  const brightnessAmount = (options.brightness / 100) * 255;

  // Contrast adjustment
  const contrastFactor =
    (259 * ((options.contrast / 100) * 255 + 255)) /
    (255 * (259 - (options.contrast / 100) * 255));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r += brightnessAmount;
    g += brightnessAmount;
    b += brightnessAmount;

    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Saturation
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    const satFactor = 1 + options.saturation / 100;
    r = gray + satFactor * (r - gray);
    g = gray + satFactor * (g - gray);
    b = gray + satFactor * (b - gray);

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Sharpness (convolution kernel)
  if (options.sharpness > 0) {
    const factor = options.sharpness / 100;
    const tempData = new Uint8ClampedArray(data);
    const w = canvas.width;
    const h = canvas.height;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * w + x) * 4 + c;
          const center = tempData[idx] * (1 + 4 * factor);
          const neighbors =
            tempData[((y - 1) * w + x) * 4 + c] +
            tempData[((y + 1) * w + x) * 4 + c] +
            tempData[(y * w + (x - 1)) * 4 + c] +
            tempData[(y * w + (x + 1)) * 4 + c];
          data[idx] = Math.max(
            0,
            Math.min(255, center - factor * neighbors)
          );
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function applyFilter(
  img: HTMLImageElement,
  filter: FilterPreset
): string {
  return applyEnhance(img, {
    brightness: filter.brightness,
    contrast: filter.contrast,
    saturation: filter.saturation,
    sharpness: 0,
  });
}

export function cropImage(
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
