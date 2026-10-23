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
  const download = () => {
    const svg = root.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const original = Array.from(svg.querySelectorAll('[fill]'));
    clone.querySelectorAll('[fill]').forEach((element, index) => {
      element.setAttribute('fill', getComputedStyle(original[index] ?? svg).fill);
    });
    const address = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }),
    );
    const anchor = document.createElement('a');
    anchor.href = address;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(address), 1000);
  };
  return (
    <div {...props} ref={root} className={classes('leaf-qr-code', className)}>
      <div
        className="leaf-qr-code__image"
        style={{ width: Math.max(64, size), height: Math.max(64, size) }}
      >
        <QRCodeSVG
          value={value}
          size={Math.max(64, size)}
          level={level}
          marginSize={2}
          fgColor={color}
          bgColor={backgroundColor}
          title={props['aria-label'] ?? t('qrCode.qrCode')}
          imageSettings={
            logo ? { src: logo, width: logoSize, height: logoSize, excavate: true } : undefined
          }
        />
        {status !== 'active' && (
          <div className="leaf-qr-code__overlay">
            {status === 'loading' ? (
              <Loading />
            ) : (
              <ButtonControl variant="outline" startIcon={<RefreshCw />} onClick={onRefresh}>
                {t('qrCode.refreshCode')}
              </ButtonControl>
            )}
          </div>
        )}
      </div>
      {downloadable && (
        <ButtonControl size="sm" variant="text" startIcon={<Download />} onClick={download}>
          {t('common.download')}
        </ButtonControl>
      )}
    </div>
  );
}
