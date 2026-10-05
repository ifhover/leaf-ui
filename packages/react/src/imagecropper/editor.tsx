import { Crop, ImageOff, RotateCcw } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from 'react-image-crop';
import { Button } from '../button';
import { Loading } from '../loading';
import { useText } from '../shared/use-text';
import { cropImage } from './crop';
import type { CropArea, ImageCropperHandle, ImageCropperProps } from './imagecropper';

export const CropEditor = forwardRef<ImageCropperHandle, ImageCropperProps>(function CropEditor(
  {
    src,
    aspect,
    shape = 'rect',
    minWidth = 24,
    minHeight = 24,
    disabled = false,
    showGrid = true,
    showActions = true,
    crossOrigin = 'anonymous',
    type = 'image/png',
    quality = 0.92,
    onChange,
    onExport,
    onError,
    extra,
    className: _className,
    style: _style,
    ...props
  },
  ref,
) {
  const t = useText();
  const image = useRef<HTMLImageElement>(null);
  const area = useRef<CropArea | null>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [exportError, setExportError] = useState('');
  const [dimensions, setDimensions] = useState<CropArea | null>(null);
  const mounted = useRef(true);
  const ratio = shape === 'round' ? 1 : aspect;
  const update = (next: PercentCrop) => {
    const node = image.current;
    if (!node?.naturalWidth) return;
    setCrop(next);
    const pixels = {
      x: (node.naturalWidth * next.x) / 100,
      y: (node.naturalHeight * next.y) / 100,
      width: (node.naturalWidth * next.width) / 100,
      height: (node.naturalHeight * next.height) / 100,
    };
    area.current = pixels;
    setDimensions(pixels);
    onChange?.(pixels);
  };
  const reset = () => {
    const node = image.current;
    if (!node?.naturalWidth) return;
    setExportError('');
    const next =
      ratio && ratio > 0
        ? centerCrop(
            makeAspectCrop({ unit: '%', width: 80 }, ratio, node.naturalWidth, node.naturalHeight),
            node.naturalWidth,
            node.naturalHeight,
          )
        : { unit: '%' as const, x: 10, y: 10, width: 80, height: 80 };
    update(next);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Ratio changes reset the selection; ordinary dragging must not reset it.
  useEffect(() => {
    if (ready) reset();
  }, [ratio]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const exportImage = async () => {
    if (!ready || !area.current || error) throw new Error('Image is not ready.');
    return cropImage(src, area.current, shape, type, quality, crossOrigin);
  };
  useImperativeHandle(ref, () => ({ export: exportImage, reset }));
  return (
    <div {...props}>
      <div className="leaf-image-cropper__stage" data-disabled={disabled || undefined}>
        <ReactCrop
          crop={crop}
          aspect={ratio && ratio > 0 ? ratio : undefined}
          circularCrop={shape === 'round'}
          disabled={disabled || !ready || Boolean(error)}
          keepSelection
          minWidth={minWidth}
          minHeight={minHeight}
          ruleOfThirds={showGrid}
          onChange={(_pixels, percent) => update(percent)}
          ariaLabels={{
            cropArea: t(
              '裁剪区域，方向键移动，拖动边缘调整大小',
              'Crop selection. Arrow keys move; drag edges to resize',
            ),
            nwDragHandle: t('左上角', 'Top left'),
            nDragHandle: t('上边缘', 'Top edge'),
            neDragHandle: t('右上角', 'Top right'),
            eDragHandle: t('右边缘', 'Right edge'),
            seDragHandle: t('右下角', 'Bottom right'),
            sDragHandle: t('下边缘', 'Bottom edge'),
            swDragHandle: t('左下角', 'Bottom left'),
            wDragHandle: t('左边缘', 'Left edge'),
          }}
        >
          <img
            ref={image}
            src={src}
            alt={t('待裁剪图片', 'Image to crop')}
            crossOrigin={crossOrigin}
            draggable={false}
            onLoad={() => {
              setReady(true);
              setError('');
              reset();
            }}
            onError={() => {
              area.current = null;
              setReady(false);
              setError(t('图片加载失败', 'Image could not be loaded'));
              onError?.(new Error('Unable to load image.'));
            }}
          />
        </ReactCrop>
        {!ready && !error && (
          <div className="leaf-image-cropper__placeholder">
            <Loading />
          </div>
        )}
        {error && (
          <div className="leaf-image-cropper__placeholder">
            <ImageOff size={28} aria-hidden="true" />
          </div>
        )}
        {ready && dimensions && (
          <output
            className="leaf-image-cropper__dimensions"
            aria-label={t('裁剪尺寸', 'Crop dimensions')}
          >
            {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
          </output>
        )}
      </div>
      {showActions && (
        <div className="leaf-image-cropper__actions">
          <span className="leaf-image-cropper__hint">
            {t('拖动选框移动 · 拖动边缘调整', 'Move the selection · Drag its edges to resize')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            startIcon={<RotateCcw size={15} />}
            onClick={reset}
            disabled={!ready || disabled || busy}
          >
            {t('重置', 'Reset')}
          </Button>
          {onExport && (
            <Button
              size="sm"
              startIcon={<Crop size={15} />}
              disabled={!ready || disabled || Boolean(error)}
              loading={busy}
              onClick={async () => {
                if (busy) return;
                setBusy(true);
                setExportError('');
                try {
                  const result = await exportImage();
                  if (mounted.current) onExport(result);
                } catch (reason) {
                  if (mounted.current) {
                    setExportError(
                      t(
                        '导出失败，请检查图片跨域权限',
                        'Export failed. Check image CORS permissions.',
                      ),
                    );
                    onError?.(reason instanceof Error ? reason : new Error(String(reason)));
                  }
                } finally {
                  if (mounted.current) setBusy(false);
                }
              }}
            >
              {t('裁剪', 'Crop')}
            </Button>
          )}
          {extra}
        </div>
      )}
      {(error || exportError) && (
        <p role="alert" className="leaf-image-cropper__error">
          {error || exportError}
        </p>
      )}
    </div>
  );
});
