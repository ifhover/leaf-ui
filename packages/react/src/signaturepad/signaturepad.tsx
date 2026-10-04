import { Eraser, Undo2 } from 'lucide-react';
import {
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type Pad from 'signature_pad';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
export interface SignaturePoint {
  x: number;
  y: number;
  pressure: number;
  time: number;
}
export interface SignatureStroke {
  points: SignaturePoint[];
  penColor: string;
  minWidth: number;
  maxWidth: number;
  dotSize: number;
  velocityFilterWeight: number;
  compositeOperation: GlobalCompositeOperation;
}
export interface SignaturePadHandle {
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
  getData: () => SignatureStroke[];
  export: (type?: 'image/png' | 'image/jpeg' | 'image/svg+xml') => Promise<Blob>;
}
export interface SignaturePadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError' | 'defaultValue'> {
  value?: readonly SignatureStroke[];
  defaultValue?: readonly SignatureStroke[];
  onChange?: (strokes: SignatureStroke[]) => void;
  onError?: (error: Error) => void;
  penColor?: string;
  backgroundColor?: string;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  disabled?: boolean;
  controls?: boolean;
}
export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  {
    value,
    defaultValue = [],
    onChange,
    onError,
    penColor = '#203329',
    backgroundColor = '#ffffff',
    minWidth = 0.5,
    maxWidth = 2.5,
    height = 220,
    disabled = false,
    controls = true,
    className,
    style,
    ...props
  },
  ref,
) {
  const t = useText();
  const canvas = useRef<HTMLCanvasElement>(null);
  const pad = useRef<Pad | null>(null);
  const [ready, setReady] = useState(false);
  const [empty, setEmpty] = useState(true);
  const latest = useRef({
    value,
    defaultValue,
    onChange,
    onError,
    penColor,
    backgroundColor,
    minWidth,
    maxWidth,
    disabled,
  });
  latest.current = {
    value,
    defaultValue,
    onChange,
    onError,
    penColor,
    backgroundColor,
    minWidth,
    maxWidth,
    disabled,
  };
  const snapshot = useRef<readonly SignatureStroke[]>(value ?? defaultValue);
  const publish = useCallback(() => {
    const instance = pad.current;
    if (!instance) return;
    const data = instance
      .toData()
      .map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point })) }));
    snapshot.current = data;
    setEmpty(instance.isEmpty());
    latest.current.onChange?.(data);
    if (latest.current.value !== undefined) {
      queueMicrotask(() => {
        if (pad.current === instance) {
          instance.fromData([...(latest.current.value ?? [])]);
          setEmpty(instance.isEmpty());
        }
      });
    }
  }, []);
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    import('signature_pad')
      .then(({ default: Signature }) => {
        const node = canvas.current;
        if (disposed || !node) return;
        const config = latest.current;
        const instance = new Signature(node, {
          penColor: config.penColor,
          backgroundColor: config.backgroundColor,
          minWidth: config.minWidth,
          maxWidth: config.maxWidth,
        });
        pad.current = instance;
        let oldRatio = 0;
        let oldWidth = 0;
        let oldHeight = 0;
        const resize = () => {
          const rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const ratio = Math.max(1, window.devicePixelRatio || 1);
          if (
            node.width === Math.round(rect.width * ratio) &&
            node.height === Math.round(rect.height * ratio) &&
            oldRatio === ratio
          )
            return;
          const data = instance.toData().map((stroke) => ({
            ...stroke,
            points: stroke.points.map((point) => ({
              ...point,
              x: oldWidth ? (point.x * rect.width) / oldWidth : point.x,
              y: oldHeight ? (point.y * rect.height) / oldHeight : point.y,
            })),
          }));
          node.width = Math.round(rect.width * ratio);
          node.height = Math.round(rect.height * ratio);
          node.getContext('2d')?.scale(ratio, ratio);
          oldRatio = ratio;
          oldWidth = rect.width;
          oldHeight = rect.height;
          instance.clear();
          instance.fromData(data.length ? data : [...snapshot.current]);
          snapshot.current = instance.toData();
          setEmpty(instance.isEmpty());
        };
        instance.fromData([...snapshot.current]);
        resize();
        const ended = () => publish();
        instance.addEventListener('endStroke', ended);
        if (config.disabled) instance.off();
        observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
        observer?.observe(node);
        window.addEventListener('resize', resize);
        setReady(true);
        cleanup = () => {
          instance.off();
          instance.removeEventListener('endStroke', ended);
          window.removeEventListener('resize', resize);
          observer?.disconnect();
          if (pad.current === instance) pad.current = null;
        };
      })
      .catch((reason) => {
        if (!disposed)
          latest.current.onError?.(reason instanceof Error ? reason : new Error(String(reason)));
      });
    let cleanup = () => {};
    return () => {
      disposed = true;
      cleanup();
      observer?.disconnect();
    };
  }, [publish]);
  useEffect(() => {
    if (!ready) return;
    const instance = pad.current;
    if (!instance) return;
    instance.penColor = penColor;
    instance.backgroundColor = backgroundColor;
    instance.minWidth = minWidth;
    instance.maxWidth = maxWidth;
    instance.redraw();
    if (disabled) instance.off();
    else instance.on();
  }, [penColor, backgroundColor, minWidth, maxWidth, disabled, ready]);
  useEffect(() => {
    if (!ready || value === undefined || !pad.current) return;
    snapshot.current = value;
    pad.current.fromData([...value]);
    setEmpty(pad.current.isEmpty());
  }, [value, ready]);
  const clear = () => {
    if (disabled || !pad.current) return;
    pad.current.clear();
    publish();
  };
  const undo = () => {
    if (disabled || !pad.current) return;
    const data = pad.current.toData();
    data.pop();
    pad.current.fromData(data);
    publish();
  };
  useImperativeHandle(ref, () => ({
    clear,
    undo,
    isEmpty: () => pad.current?.isEmpty() ?? true,
    getData: () =>
      pad.current
        ?.toData()
        .map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point })) })) ??
      [],
    export: async (type = 'image/png') => {
      if (!pad.current || !canvas.current) throw new Error('Signature pad is loading.');
      if (type === 'image/svg+xml')
        return new Blob([pad.current.toSVG({ includeBackgroundColor: true })], { type });
      return new Promise<Blob>((resolve, reject) =>
        canvas.current?.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Signature export failed.'))),
          type,
        ),
      );
    },
  }));
  return (
    <div
      {...props}
      className={classes('leaf-signature-pad', className)}
      style={style}
      data-disabled={disabled ? '' : undefined}
    >
      <div className="leaf-signature-pad__surface" style={{ height, background: backgroundColor }}>
        <canvas
          ref={canvas}
          aria-label={props['aria-label'] ?? t('手写签名区域', 'Handwritten signature area')}
          role="img"
        />
        {empty && (
          <span className="leaf-signature-pad__placeholder">{t('在此签名', 'Sign here')}</span>
        )}
      </div>
      {controls && (
        <div className="leaf-signature-pad__controls">
          <Button
            variant="ghost"
            size="sm"
            startIcon={<Undo2 size={15} />}
            disabled={disabled || empty || !ready}
            onClick={undo}
          >
            {t('撤销', 'Undo')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            startIcon={<Eraser size={15} />}
            disabled={disabled || empty || !ready}
            onClick={clear}
          >
            {t('清空', 'Clear')}
          </Button>
        </div>
      )}
    </div>
  );
});
