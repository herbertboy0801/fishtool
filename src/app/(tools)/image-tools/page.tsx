"use client";

import { useState, useCallback, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TabBar } from "@/components/layout/tab-bar";
import { showToast } from "@/components/ui/toast";
import {
  loadImage,
  compressImage,
  applyEnhance,
  applyFilter,
  filterPresets,
  enhancePresets,
  formatFileSize,
  type CompressOptions,
  type EnhanceOptions,
} from "@/lib/image-processing";

type ToolTab = "compress" | "crop" | "enhance" | "filter";

const qualityOptions = [
  { label: "高清", value: 0.85 },
  { label: "标准", value: 0.7 },
  { label: "极速", value: 0.5 },
];

const formatOptions = ["jpeg", "png", "webp"] as const;

const sizeOptions = [
  { label: "原始", value: 0 },
  { label: "1920px", value: 1920 },
  { label: "1080px", value: 1080 },
  { label: "720px", value: 720 },
];

const cropRatios = [
  { label: "自由", value: 0 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "9:16", value: 9 / 16 },
];

export default function ImageToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>("compress");
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress state
  const [quality, setQuality] = useState(0.85);
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [maxWidth, setMaxWidth] = useState(0);

  // Enhance state
  const [enhance, setEnhance] = useState<EnhanceOptions>({
    sharpness: 0,
    contrast: 0,
    saturation: 0,
    brightness: 0,
  });

  // Filter state
  const [activeFilter, setActiveFilter] = useState(0);

  // Crop state
  const [cropRatio, setCropRatio] = useState(0);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("请选择图片文件", "error");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast("图片不能超过 10MB", "error");
        return;
      }

      try {
        const img = await loadImage(file);
        setOriginalImage(img);
        setOriginalSize(file.size);
        setPreviewUrl(img.src);
        setProcessedSize(0);
        showToast(
          `已加载 ${img.width}×${img.height} | ${formatFileSize(file.size)}`,
          "success"
        );
      } catch {
        showToast("图片加载失败", "error");
      }
    },
    []
  );

  const handleCompress = useCallback(() => {
    if (!originalImage) return;
    const options: CompressOptions = {
      quality,
      format,
      maxWidth: maxWidth || undefined,
    };
    const result = compressImage(originalImage, options);
    setPreviewUrl(result.dataUrl);
    setProcessedSize(result.size);
    showToast(
      `压缩完成: ${formatFileSize(result.size)}`,
      "success"
    );
  }, [originalImage, quality, format, maxWidth]);

  const handleEnhance = useCallback(() => {
    if (!originalImage) return;
    const result = applyEnhance(originalImage, enhance);
    setPreviewUrl(result);
    showToast("增强处理完成", "success");
  }, [originalImage, enhance]);

  const handleEnhancePreset = useCallback(
    (preset: (typeof enhancePresets)[number]) => {
      setEnhance({
        sharpness: preset.sharpness,
        contrast: preset.contrast,
        saturation: preset.saturation,
        brightness: preset.brightness,
      });
      if (!originalImage) return;
      const result = applyEnhance(originalImage, {
        sharpness: preset.sharpness,
        contrast: preset.contrast,
        saturation: preset.saturation,
        brightness: preset.brightness,
      });
      setPreviewUrl(result);
      showToast(`已应用「${preset.name}」`, "info");
    },
    [originalImage]
  );

  const handleFilter = useCallback(
    (index: number) => {
      setActiveFilter(index);
      if (!originalImage) return;
      const filter = filterPresets[index];
      if (index === 0) {
        setPreviewUrl(originalImage.src);
      } else {
        const result = applyFilter(originalImage, filter);
        setPreviewUrl(result);
      }
      showToast(`已应用「${filter.name}」滤镜`, "info");
    },
    [originalImage]
  );

  const handleCrop = useCallback(() => {
    if (!originalImage) return;
    const { width, height } = originalImage;
    let cropW = width;
    let cropH = height;

    if (cropRatio > 0) {
      if (width / height > cropRatio) {
        cropW = Math.round(height * cropRatio);
      } else {
        cropH = Math.round(width / cropRatio);
      }
    }

    const x = Math.round((width - cropW) / 2);
    const y = Math.round((height - cropH) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(originalImage, x, y, cropW, cropH, 0, 0, cropW, cropH);
    const result = canvas.toDataURL("image/png");
    setPreviewUrl(result);
    showToast(`已裁剪为 ${cropW}×${cropH}`, "success");
  }, [originalImage, cropRatio]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `fishtool-${activeTab}-${Date.now()}.${format}`;
    link.href = previewUrl;
    link.click();
    showToast("图片已下载", "success");
  }, [previewUrl, activeTab, format]);

  const handleReset = useCallback(() => {
    if (originalImage) {
      setPreviewUrl(originalImage.src);
      setProcessedSize(0);
      setEnhance({ sharpness: 0, contrast: 0, saturation: 0, brightness: 0 });
      setActiveFilter(0);
      showToast("已重置", "info");
    }
  }, [originalImage]);

  return (
    <div>
      <PageHeader title="图片工具箱" subtitle="压缩、裁剪、高清与滤镜处理" />

      <div className="space-y-4 px-4 py-4">
        {/* Tab Switch */}
        <TabBar
          tabs={[
            { key: "compress", label: "压缩" },
            { key: "crop", label: "裁剪" },
            { key: "enhance", label: "增强" },
            { key: "filter", label: "滤镜" },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => {
            setActiveTab(key as ToolTab);
            if (originalImage) setPreviewUrl(originalImage.src);
          }}
        />

        {/* Upload Area */}
        {!originalImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 transition-colors hover:border-primary touch-feedback"
          >
            <span className="text-4xl">📷</span>
            <p className="mt-3 text-sm text-muted">点击上传图片</p>
            <p className="mt-1 text-xs text-muted/50">
              支持 JPG/PNG/WebP，最大 10MB
            </p>
          </div>
        ) : (
          <>
            {/* Image Preview */}
            <div className="rounded-xl bg-card p-3">
              <div className="relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl ?? originalImage.src}
                  alt="Preview"
                  className="w-full object-contain"
                  style={{ maxHeight: 300 }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>
                  原图: {originalImage.width}×{originalImage.height} |{" "}
                  {formatFileSize(originalSize)}
                </span>
                {processedSize > 0 && (
                  <span className="text-success">
                    → {formatFileSize(processedSize)} (
                    {Math.round((1 - processedSize / originalSize) * 100)}%
                    减少)
                  </span>
                )}
              </div>
            </div>

            {/* Tool Controls */}
            <div className="rounded-xl bg-card p-4">
              {activeTab === "compress" && (
                <CompressControls
                  quality={quality}
                  setQuality={setQuality}
                  format={format}
                  setFormat={setFormat}
                  maxWidth={maxWidth}
                  setMaxWidth={setMaxWidth}
                  onProcess={handleCompress}
                />
              )}
              {activeTab === "crop" && (
                <CropControls
                  cropRatio={cropRatio}
                  setCropRatio={setCropRatio}
                  onProcess={handleCrop}
                />
              )}
              {activeTab === "enhance" && (
                <EnhanceControls
                  enhance={enhance}
                  setEnhance={setEnhance}
                  onProcess={handleEnhance}
                  onPreset={handleEnhancePreset}
                />
              )}
              {activeTab === "filter" && (
                <FilterControls
                  activeFilter={activeFilter}
                  onFilter={handleFilter}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
              >
                下载图片
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:bg-card-hover touch-feedback"
              >
                重置
              </button>
              <button
                onClick={() => {
                  setOriginalImage(null);
                  setPreviewUrl(null);
                  setProcessedSize(0);
                }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:bg-card-hover touch-feedback"
              >
                换图
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}

// --- Sub-components ---

function CompressControls({
  quality,
  setQuality,
  format,
  setFormat,
  maxWidth,
  setMaxWidth,
  onProcess,
}: {
  quality: number;
  setQuality: (v: number) => void;
  format: "jpeg" | "png" | "webp";
  setFormat: (v: "jpeg" | "png" | "webp") => void;
  maxWidth: number;
  setMaxWidth: (v: number) => void;
  onProcess: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">压缩质量</p>
        <div className="flex gap-2">
          {qualityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQuality(opt.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors touch-feedback ${
                quality === opt.value
                  ? "bg-primary text-black"
                  : "bg-background text-muted"
              }`}
            >
              {opt.label} ({Math.round(opt.value * 100)}%)
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">输出格式</p>
        <div className="flex gap-2">
          {formatOptions.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium uppercase transition-colors touch-feedback ${
                format === fmt
                  ? "bg-primary text-black"
                  : "bg-background text-muted"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">尺寸限制</p>
        <div className="flex gap-2">
          {sizeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMaxWidth(opt.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors touch-feedback ${
                maxWidth === opt.value
                  ? "bg-primary text-black"
                  : "bg-background text-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onProcess}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
      >
        开始压缩
      </button>
    </div>
  );
}

function CropControls({
  cropRatio,
  setCropRatio,
  onProcess,
}: {
  cropRatio: number;
  setCropRatio: (v: number) => void;
  onProcess: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">裁剪比例</p>
        <div className="flex gap-2">
          {cropRatios.map((r) => (
            <button
              key={r.label}
              onClick={() => setCropRatio(r.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors touch-feedback ${
                cropRatio === r.value
                  ? "bg-primary text-black"
                  : "bg-background text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted">
        将从图片中心按所选比例裁剪
      </p>
      <button
        onClick={onProcess}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
      >
        裁剪图片
      </button>
    </div>
  );
}

function EnhanceControls({
  enhance,
  setEnhance,
  onProcess,
  onPreset,
}: {
  enhance: EnhanceOptions;
  setEnhance: (v: EnhanceOptions) => void;
  onProcess: () => void;
  onPreset: (p: (typeof enhancePresets)[number]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">快速预设</p>
        <div className="grid grid-cols-3 gap-2">
          {enhancePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onPreset(preset)}
              className="rounded-lg bg-background py-2 text-xs text-muted transition-colors hover:bg-card-hover hover:text-foreground touch-feedback"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      <Slider
        label="锐度"
        value={enhance.sharpness}
        onChange={(v) => setEnhance({ ...enhance, sharpness: v })}
      />
      <Slider
        label="对比度"
        value={enhance.contrast}
        onChange={(v) => setEnhance({ ...enhance, contrast: v })}
      />
      <Slider
        label="饱和度"
        value={enhance.saturation}
        onChange={(v) => setEnhance({ ...enhance, saturation: v })}
      />
      <Slider
        label="亮度"
        value={enhance.brightness}
        onChange={(v) => setEnhance({ ...enhance, brightness: v })}
      />
      <button
        onClick={onProcess}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
      >
        应用增强
      </button>
    </div>
  );
}

function FilterControls({
  activeFilter,
  onFilter,
}: {
  activeFilter: number;
  onFilter: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">选择滤镜</p>
      <div className="grid grid-cols-5 gap-2">
        {filterPresets.map((filter, i) => (
          <button
            key={filter.name}
            onClick={() => onFilter(i)}
            className={`rounded-lg py-3 text-xs font-medium transition-colors touch-feedback ${
              activeFilter === i
                ? "bg-primary text-black"
                : "bg-background text-muted"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-xs text-muted">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className="w-8 text-right text-xs text-muted">{value}</span>
    </div>
  );
}
