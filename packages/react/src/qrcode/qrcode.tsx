import { Download, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { type HTMLAttributes, useRef } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { LoadingControl as Loading } from '../loading/loading';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
export interface QRCodeProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  logo?: string;
  logoSize?: number;
  status?: 'active' | 'loading' | 'expired';
  onRefresh?: () => void;
  downloadable?: boolean;
  fileName?: string;
}
export function QRCode(rawProps: QRCodeProps) {
  const {
    value,
    size = 160,
    color = 'var(--leaf-color-text)',
    backgroundColor = 'var(--leaf-color-surface)',
    level = 'M',
    logo,
    logoSize = 32,
    status = 'active',
    onRefresh,
    downloadable = false,
    fileName = 'qrcode.svg',
    className,
    ...props
  } = useComponentProps('QRCode', rawProps);
  const t = useText();
  const root = useRef<HTMLDivElement>(null);
  const clampedSize = Math.max(64, Number.isFinite(size) ? size : 160);
  const safeLogoSize = Math.max(
    12,
    Math.min(Number.isFinite(logoSize) ? logoSize : 32, Math.round(clampedSize * 0.3)),
  );
  const triggerDownload = (href: string, name: string) => {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  const serializeSvg = async (svg: SVGSVGElement, clone: SVGSVGElement) => {
    const originalFills = Array.from(svg.querySelectorAll('[fill]'));
    clone.querySelectorAll('[fill]').forEach((element, index) => {
      const value = element.getAttribute('fill');
      if (value && value !== 'none') {
        element.setAttribute('fill', getComputedStyle(originalFills[index] ?? svg).fill);
      }
    });
    const originalStrokes = Array.from(svg.querySelectorAll('[stroke]'));
    clone.querySelectorAll('[stroke]').forEach((element, index) => {
      const value = element.getAttribute('stroke');
      if (value && value !== 'none') {
        element.setAttribute('stroke', getComputedStyle(originalStrokes[index] ?? svg).stroke);
      }
    });
    const svgStyle = getComputedStyle(svg);
    if (svgStyle.backgroundColor) clone.style.backgroundColor = svgStyle.backgroundColor;
    if (!clone.getAttribute('width')) clone.setAttribute('width', String(clampedSize));
    if (!clone.getAttribute('height')) clone.setAttribute('height', String(clampedSize));
    const images = Array.from(clone.querySelectorAll('image'));
    for (const image of images) {
      const source = image.getAttribute('href') ?? image.getAttribute('xlink:href');
      if (!source || source.startsWith('data:') || source.startsWith('blob:')) continue;
      let resolved = source;
      try {
        resolved = new URL(source, document.baseURI).href;
      } catch {
        // 保留原始地址
      }
      try {
        const response = await fetch(resolved);
        if (response.ok) {
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          image.setAttribute('href', dataUrl);
          continue;
        }
      } catch {
        // 跨域或离线环境退回绝对 URL
      }
      image.setAttribute('href', resolved);
    }
    return new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
  };
  const download = () => {
    if (status !== 'active') return;
    const svg = root.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const hasExternalLogo = Array.from(clone.querySelectorAll('image')).some((image) => {
      const source = image.getAttribute('href') ?? image.getAttribute('xlink:href') ?? '';
      return source && !source.startsWith('data:') && !source.startsWith('blob:');
    });
    const isPng = fileName.trim().toLowerCase().endsWith('.png');
    if (!hasExternalLogo && !isPng) {
      const originalFills = Array.from(svg.querySelectorAll('[fill]'));
      clone.querySelectorAll('[fill]').forEach((element, index) => {
        const value = element.getAttribute('fill');
        if (value && value !== 'none') {
          element.setAttribute('fill', getComputedStyle(originalFills[index] ?? svg).fill);
        }
      });
      const svgStyle = getComputedStyle(svg);
      if (svgStyle.backgroundColor) clone.style.backgroundColor = svgStyle.backgroundColor;
      if (!clone.getAttribute('width')) clone.setAttribute('width', String(clampedSize));
      if (!clone.getAttribute('height')) clone.setAttribute('height', String(clampedSize));
      const address = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }),
      );
      triggerDownload(address, fileName);
      return;
    }
    void (async () => {
      const svgBlob = await serializeSvg(svg, clone);
      const svgUrl = URL.createObjectURL(svgBlob);
      if (!isPng) {
        triggerDownload(svgUrl, fileName);
        return;
      }
      const raster = new Image();
      raster.onload = () => {
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = clampedSize * scale;
        canvas.height = clampedSize * scale;
        const context = canvas.getContext('2d');
        if (!context) {
          triggerDownload(svgUrl, fileName);
          return;
        }
        context.drawImage(raster, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((pngBlob) => {
          URL.revokeObjectURL(svgUrl);
          if (pngBlob) {
            triggerDownload(URL.createObjectURL(pngBlob), fileName);
          }
        }, 'image/png');
      };
      raster.onerror = () => {
        triggerDownload(svgUrl, fileName);
      };
      raster.src = svgUrl;
    })();
  };
  return (
    <div {...props} ref={root} className={classes('leaf-qr-code', className)} data-status={status}>
      <div className="leaf-qr-code__image" style={{ width: clampedSize, height: clampedSize }}>
        <QRCodeSVG
          value={value}
          size={clampedSize}
          level={level}
          marginSize={2}
          fgColor={color}
          bgColor={backgroundColor}
          aria-hidden={status !== 'active' || undefined}
          title={props['aria-label'] ?? t('qrCode.qrCode')}
          imageSettings={
            logo
              ? { src: logo, width: safeLogoSize, height: safeLogoSize, excavate: true }
              : undefined
          }
        />
        {status !== 'active' && (
          <div className="leaf-qr-code__overlay">
            {status === 'loading' ? (
              <Loading />
            ) : (
              <>
                <span className="leaf-qr-code__expired" role="status">
                  {t('qrCode.expired')}
                </span>
                <ButtonControl variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw aria-hidden="true" />
                  {t('qrCode.refreshCode')}
                </ButtonControl>
              </>
            )}
          </div>
        )}
      </div>
      {downloadable && (
        <ButtonControl size="sm" variant="text" disabled={status !== 'active'} onClick={download}>
          <Download aria-hidden="true" />
          {t('common.download')}
        </ButtonControl>
      )}
    </div>
  );
}
