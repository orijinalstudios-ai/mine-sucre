import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './Icon';

const ASPECT_RATIOS = [
  { id: '16:10', label: '16:10 Keepsake', ratio: 16 / 10 },
  { id: '4:3', label: '4:3 Classic', ratio: 4 / 3 },
  { id: '1:1', label: '1:1 Square', ratio: 1 / 1 },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
  { id: '16:9', label: '16:9 Wide', ratio: 16 / 9 },
  { id: 'natural', label: 'Original', ratio: null },
];

export default function ImageCropModal({
  isOpen,
  imageUrl,
  initialAspectRatio = '16:10',
  onCropComplete,
  onClose,
  title = 'Adjust Photo Framing',
}) {
  const [selectedRatioId, setSelectedRatioId] = useState(initialAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageMeta, setImageMeta] = useState(null); // { width, height, aspect }
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const zoomStartRef = useRef(1);

  const containerRef = useRef(null);
  const cropAreaRef = useRef(null);
  const imageRef = useRef(null);

  // Load image dimensions
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspect: img.naturalWidth / img.naturalHeight,
      });
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  // Determine current active aspect ratio
  const activeRatioConfig = ASPECT_RATIOS.find((r) => r.id === selectedRatioId) || ASPECT_RATIOS[0];
  const targetRatio = activeRatioConfig.ratio || (imageMeta ? imageMeta.aspect : 16 / 10);

  // Reset framing
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag & pinch zoom handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      zoomStartRef.current = zoom;
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / pinchStartDistRef.current;
      const newZoom = Math.min(3, Math.max(1, zoomStartRef.current * factor));
      setZoom(newZoom);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    pinchStartDistRef.current = null;
  }, []);

  // Global mouse up listener for smooth dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate crop window dimensions relative to container viewport
  const maxBoxWidth = 320;
  const maxBoxHeight = 260;
  let boxW = 320;
  let boxH = 200;

  if (targetRatio >= 1) {
    boxW = maxBoxWidth;
    boxH = maxBoxWidth / targetRatio;
    if (boxH > maxBoxHeight) {
      boxH = maxBoxHeight;
      boxW = maxBoxHeight * targetRatio;
    }
  } else {
    boxH = maxBoxHeight;
    boxW = maxBoxHeight * targetRatio;
    if (boxW > maxBoxWidth) {
      boxW = maxBoxWidth;
      boxH = maxBoxWidth / targetRatio;
    }
  }

  // Base dimensions to ensure image covers the crop frame at zoom 1
  const imgAspect = imageMeta ? imageMeta.aspect : 1;
  let baseW = boxW;
  let baseH = boxW / imgAspect;
  if (baseH < boxH) {
    baseH = boxH;
    baseW = boxH * imgAspect;
  }

  // Generate cropped image on canvas
  const handleApplyCrop = async () => {
    if (!imageMeta || !imageUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Crop frame dimensions on screen
      const cropArea = cropAreaRef.current;
      const imageEl = imageRef.current;
      if (!cropArea || !imageEl) {
        onCropComplete(imageUrl);
        return;
      }

      const cropRect = cropArea.getBoundingClientRect();
      const imageRect = imageEl.getBoundingClientRect();

      // Output canvas resolution: target high clarity ~1200px width
      const targetWidth = 1200;
      const targetHeight = Math.round(targetWidth / targetRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Scale between screen crop box and canvas resolution
      const scale = targetWidth / cropRect.width;

      // Draw transformed image
      ctx.save();
      // Center canvas coordinates
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // Apply translation relative to crop center
      const offsetX = (imageRect.left + imageRect.width / 2 - (cropRect.left + cropRect.width / 2)) * scale;
      const offsetY = (imageRect.top + imageRect.height / 2 - (cropRect.top + cropRect.height / 2)) * scale;

      ctx.translate(offsetX, offsetY);
      ctx.rotate((rotation * Math.PI) / 180);

      const drawW = baseW * zoom * scale;
      const drawH = baseH * zoom * scale;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Error applying crop:', err);
      // Fallback: return original
      onCropComplete(imageUrl);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-surface rounded-2xl max-w-md w-full border border-secondary/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2">
            <Icon name="crop" size={16} className="text-secondary" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-primary">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-7 h-7 rounded-full border border-outline-variant/30 hover:border-secondary flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Interactive Viewport Canvas */}
        <div
          ref={containerRef}
          className="relative bg-black flex items-center justify-center overflow-hidden select-none touch-none h-[300px] sm:h-[340px] cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Crop Frame */}
          <div
            ref={cropAreaRef}
            style={{ width: `${boxW}px`, height: `${boxH}px` }}
            className="relative pointer-events-none z-10 border-2 border-[#ffd79b] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-lg overflow-hidden transition-all duration-200"
          >
            {/* Rule of Thirds 3x3 Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
              <div className="border-r border-b border-[#ffd79b]/60"></div>
              <div className="border-r border-b border-[#ffd79b]/60"></div>
              <div className="border-b border-[#ffd79b]/60"></div>
              <div className="border-r border-b border-[#ffd79b]/60"></div>
              <div className="border-r border-b border-[#ffd79b]/60"></div>
              <div className="border-b border-[#ffd79b]/60"></div>
              <div className="border-r border-[#ffd79b]/60"></div>
              <div className="border-r border-[#ffd79b]/60"></div>
              <div></div>
            </div>

            {/* Corner Markers */}
            <span className="absolute top-1 left-1 text-[8px] text-[#ffd79b] font-montserrat uppercase tracking-wider font-semibold">
              ✦ Framing Box
            </span>
          </div>

          {/* Under-canvas Image with Transform */}
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop Source"
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                maxWidth: 'none',
                width: `${baseW}px`,
                height: `${baseH}px`,
              }}
              className="absolute pointer-events-none transition-transform duration-75 origin-center will-change-transform"
            />
          )}

          {/* Hint Overlay */}
          <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none z-20">
            <span className="px-2.5 py-1 rounded-full bg-black/75 text-[10px] text-[#ffd79b] font-sans border border-[#ffd79b]/30 backdrop-blur-xs">
              Drag to center faces · Pinch or slide to zoom
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-3 sm:p-4 space-y-3 bg-surface-container-low/40">
          {/* Aspect Ratio Selector Pills */}
          <div>
            <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-1.5">
              Framing Ratio (App Card Display)
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedRatioId(item.id);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-montserrat uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                    selectedRatioId === item.id
                      ? 'bg-primary text-secondary-fixed font-bold border border-secondary shadow-xs'
                      : 'bg-surface text-on-surface-variant hover:text-primary border border-outline-variant/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom & Rotate Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                className="w-7 h-7 rounded-full border border-secondary/30 flex items-center justify-center text-secondary active:scale-90"
                title="Zoom Out"
              >
                <Icon name="remove" size={14} />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-primary h-1 bg-surface-container rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className="w-7 h-7 rounded-full border border-secondary/30 flex items-center justify-center text-secondary active:scale-90"
                title="Zoom In"
              >
                <Icon name="add" size={14} />
              </button>

              <span className="font-montserrat text-[10px] text-on-surface-variant min-w-[34px] text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRotate}
                className="px-2 py-1 rounded-lg border border-secondary/30 text-secondary hover:bg-secondary-container/20 text-xs font-montserrat font-semibold flex items-center gap-1 active:scale-95"
                title="Rotate 90 degrees"
              >
                <Icon name="sync" size={12} />
                <span>90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary text-xs font-montserrat active:scale-95"
                title="Reset crop"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 sm:p-4 border-t border-outline-variant/30 flex items-center justify-between gap-3 bg-surface">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-full border border-outline-variant/40 text-on-surface-variant hover:text-primary text-xs font-montserrat uppercase font-semibold active:scale-95 transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-[#4a1622] text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            <Icon name={isProcessing ? 'sync' : 'check'} size={14} className={isProcessing ? 'animate-spin' : ''} />
            <span>{isProcessing ? 'Cropping...' : 'Apply Crop ✦'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
