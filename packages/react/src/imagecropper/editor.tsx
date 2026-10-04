import { RotateCcw } from 'lucide-react';
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '../button';
import { useText } from '../shared/use-text';
import { Slider } from '../slider';
import { cropImage } from './crop';
import type { CropArea, ImageCropperHandle, ImageCropperProps } from './imagecropper';
export const CropEditor = forwardRef<ImageCropperHandle, ImageCropperProps>(function CropEditor(
  {
    src,
    aspect = 1,
    shape = 'rect',
    minZoom = 1,
    maxZoom = 3,
    showGrid = true,
    controls = true,
    rotation: allowRotation = true,
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
  const id = useId();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(minZoom);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const area = useRef<CropArea | null>(null);
  const mounted = useRef(true);
  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(minZoom);
    setRotation(0);
    setError('');
    area.current = null;
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed source must reset the previous crop coordinates.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(minZoom);
    setRotation(0);
    setError('');
    area.current = null;
  }, [src, minZoom]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const exportImage = async () => {
    if (!area.current) throw new Error('Image is not ready.');
    return cropImage(src, area.current, rotation, shape, type, quality, crossOrigin);
  };
  useImperativeHandle(ref, () => ({ export: exportImage, reset }));
  return (
    <div {...props}>
      <div className="leaf-image-cropper__stage">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          minZoom={minZoom}
          maxZoom={maxZoom}
          cropShape={shape}
          showGrid={showGrid}
          disableAutomaticStylesInjection
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={allowRotation ? setRotation : undefined}
          onCropComplete={(_percentage, pixels) => {
            area.current = pixels;
            onChange?.(pixels);
          }}
          mediaProps={{
            crossOrigin,
            onError: () => {
              const reason = new Error('Unable to load image.');
              setError(t('图片加载失败', 'Image could not be loaded'));
              onError?.(reason);
            },
          }}
        />
      </div>
      {controls && (
        <div className="leaf-image-cropper__controls">
          <label htmlFor={`${id}-zoom`} className="leaf-image-cropper__slider">
            <span>{t('缩放', 'Zoom')}</span>
            <Slider
              id={`${id}-zoom`}
              min={minZoom}
              max={maxZoom}
              step={0.01}
              value={zoom}
              onChange={(value) => setZoom(value as number)}
              aria-label={t('缩放', 'Zoom')}
            />
          </label>
          {allowRotation && (
            <label htmlFor={`${id}-rotation`} className="leaf-image-cropper__slider">
              <span>{t('旋转', 'Rotation')}</span>
              <Slider
                id={`${id}-rotation`}
                min={-180}
                max={180}
                value={rotation}
                onChange={(value) => setRotation(value as number)}
                aria-label={t('旋转', 'Rotation')}
              />
            </label>
          )}
          <Button variant="ghost" startIcon={<RotateCcw size={16} />} onClick={reset}>
            {t('重置', 'Reset')}
          </Button>
          {onExport && (
            <Button
              loading={busy}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  const result = await exportImage();
                  if (mounted.current) onExport(result);
                } catch (reason) {
                  if (mounted.current) {
                    setError(
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
              {t('裁剪图片', 'Crop image')}
            </Button>
          )}
          {extra}
        </div>
      )}
      {error && (
        <p role="alert" className="leaf-image-cropper__error">
          {error}
        </p>
      )}
    </div>
  );
});
