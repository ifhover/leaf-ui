import { TinyColor } from '@ctrl/tinycolor';
import { Check, X } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import {
  FloatingPanel,
  type PopupOptions,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';
import { GradientColorPicker } from './gradient';

export interface ColorPreset {
  label: ReactNode;
  colors: readonly string[];
}
export interface ColorPickerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange'>,
    PopupOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  format?: 'hex' | 'rgb' | 'hsl';
  defaultFormat?: 'hex' | 'rgb' | 'hsl';
  onFormatChange?: (format: 'hex' | 'rgb' | 'hsl') => void;
  disableAlpha?: boolean;
  showText?: boolean | ((color: string) => ReactNode);
  allowClear?: boolean;
  presets?: readonly ColorPreset[];
  size?: ControlSize;
  status?: ControlStatus;
  required?: boolean;
  readOnly?: boolean;
  popupWidth?: number | string;
  onOpenChange?: (open: boolean) => void;
  gradient?: boolean;
  mode?: 'solid' | 'gradient';
  open?: boolean;
  defaultOpen?: boolean;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  popupRender?: (content: ReactNode) => ReactNode;
  getPopupContainer?: () => Element | DocumentFragment;
}
type HSV = { h: number; s: number; v: number; a: number };
const clamp = (value: number) => Math.min(1, Math.max(0, value));
export function SolidColorPicker({
  value,
  defaultValue = '#20834a',
  onChange,
  onChangeComplete,
  format: formatProp,
  defaultFormat = 'hex',
  onFormatChange,
  disableAlpha = false,
  showText = false,
  allowClear = false,
  presets,
  size = 'md',
  status: statusProp,
  required: requiredProp,
  popupWidth = 280,
  onOpenChange,
  gradient = false,
  mode: _mode,
  open: controlledOpen,
  defaultOpen,
  popupClassName,
  popupStyle,
  popupRender,
  popupPlacement,
  getPopupContainer,
  readOnly,
  disabled: disabledProp,
  name,
  form,
  className,
  style,
  'aria-label': label,
  ...props
}: ColorPickerProps) {
  const { messages } = useLeafConfig();
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const required = requiredProp ?? field?.required;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const [internalFormat, setFormat] = useState(defaultFormat);
  const format = formatProp ?? internalFormat;
  const [open, setOpen] = usePopupState(
    disabled || readOnly,
    onOpenChange,
    controlledOpen,
    defaultOpen,
  );
  const id = `${useId()}-color`;
  const color = new TinyColor(current || '#20834a');
  const hsv = color.isValid ? color.toHsv() : new TinyColor('#20834a').toHsv();
  const [rememberedHue, setRememberedHue] = useState(hsv.h);
  const [coordinates, setCoordinates] = useState<{ value: string; hsv: HSV }>();
  const activeHsv = {
    ...(coordinates && new TinyColor(coordinates.value).toHex8String() === color.toHex8String()
      ? coordinates.hsv
      : { ...hsv, h: hsv.s === 0 || hsv.v === 0 ? rememberedHue : hsv.h }),
    a: disableAlpha ? 1 : hsv.a,
  };
  const serialize = (next: TinyColor) => {
    const normalized = disableAlpha ? next.setAlpha(1) : next;
    return format === 'rgb'
      ? normalized.toRgbString()
      : format === 'hsl'
        ? normalized.toHslString()
        : normalized.getAlpha() < 1
          ? normalized.toHex8String()
          : normalized.toHexString();
  };
  const display = current ? serialize(new TinyColor(activeHsv)) : '';
  const [input, setInput] = useState(display);
  const [invalid, setInvalid] = useState(false);
  const latest = useRef(display);
  useEffect(() => {
    setInput(display);
    setInvalid(false);
  }, [display]);
  const close = () => {
    setOpen(false);
    setInput(display);
    setInvalid(false);
  };
  useFloatingDismiss(open, close, trigger, panel, root);
  const change = (next: HSV, complete = false) => {
    if (disabled || readOnly) return;
    setRememberedHue(next.h);
    const result = serialize(new TinyColor(next));
    setCoordinates({ value: result, hsv: { ...next, a: disableAlpha ? 1 : next.a } });
    latest.current = result;
    setCurrent(result);
    setInput(result);
    setInvalid(false);
    if (result !== current) onChange?.(result);
    if (complete) onChangeComplete?.(result);
  };
  const chooseText = () => {
    if (input === display) return;
    const next = new TinyColor(input);
    if (!next.isValid) {
      setInvalid(true);
      return;
    }
    change(next.toHsv(), true);
  };
  const areaChange = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    change({
      ...activeHsv,
      s: clamp((event.clientX - rect.left) / rect.width),
      v: clamp(1 - (event.clientY - rect.top) / rect.height),
    });
  };
  const areaKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const next = { ...activeHsv };
    if (event.key === 'ArrowLeft') next.s = clamp(next.s - step);
    else if (event.key === 'ArrowRight') next.s = clamp(next.s + step);
    else if (event.key === 'ArrowUp') next.v = clamp(next.v + step);
    else if (event.key === 'ArrowDown') next.v = clamp(next.v - step);
    else if (event.key === 'Home') next.s = 0;
    else if (event.key === 'End') next.s = 1;
    else return;
    event.preventDefault();
    change(next, true);
  };
  const previewColor = current ? new TinyColor(activeHsv).toRgbString() : 'transparent';
  const hueColor = new TinyColor({ h: activeHsv.h, s: 1, v: 1 }).toHexString();
  const opaqueColor = new TinyColor({ ...activeHsv, a: 1 }).toRgbString();
  const clearable = allowClear && Boolean(current) && !disabled && !readOnly;
  return (
    <>
      <span
        ref={root}
        className={classes('leaf-color-picker', `leaf-color-picker--${size}`, className)}
        style={style}
        data-status={status}
        data-disabled={disabled || undefined}
        data-open={open || undefined}
      >
        <button
          {...props}
          ref={trigger}
          type={props.type ?? 'button'}
          form={form}
          id={props.id ?? field?.id}
          className="leaf-color-picker__trigger"
          disabled={disabled}
          aria-label={label ?? (field?.labelId ? undefined : messages.color)}
          aria-labelledby={props['aria-labelledby'] ?? field?.labelId}
          aria-describedby={
            [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={status === 'error' || props['aria-invalid']}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          onClick={(event) => {
            props.onClick?.(event);
            if (!event.defaultPrevented) setOpen(!open);
          }}
        >
          <span className="leaf-color-picker__swatch" aria-hidden="true">
            <i style={{ background: previewColor }} />
          </span>
          {showText && (
            <span className="leaf-color-picker__text">
              {typeof showText === 'function' ? showText(display) : display || messages.color}
            </span>
          )}
        </button>
        {clearable && (
          <button
            type="button"
            className="leaf-color-picker__clear"
            aria-label={messages.clearColor}
            onClick={() => {
              setCurrent('');
              onChange?.('');
              onChangeComplete?.('');
              trigger.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
        <FormValue
          value={current}
          name={name}
          form={form}
          disabled={disabled}
          required={required}
          triggerRef={trigger}
        />
      </span>
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        className={classes('leaf-floating', 'leaf-color-picker__panel', popupClassName)}
        id={id}
        role="dialog"
        aria-label={messages.color}
        width={popupWidth}
        style={popupStyle}
        render={popupRender}
        placement={popupPlacement}
        container={getPopupContainer}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${messages.saturation} / ${messages.brightness}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(activeHsv.s * 100)}
          aria-valuetext={`${messages.saturation} ${Math.round(activeHsv.s * 100)}%, ${messages.brightness} ${Math.round(activeHsv.v * 100)}%`}
          className="leaf-color-picker__area"
          style={{
            backgroundImage: gradient
              ? `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`
              : undefined,
            backgroundColor: hueColor,
          }}
          onKeyDown={areaKey}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            areaChange(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) areaChange(event);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
              onChangeComplete?.(latest.current);
            }
          }}
        >
          <span
            className="leaf-color-picker__handle"
            style={{
              left: `${activeHsv.s * 100}%`,
              top: `${(1 - activeHsv.v) * 100}%`,
              background: opaqueColor,
            }}
          />
        </div>
        <div className="leaf-color-picker__sliders">
          <span
            className="leaf-color-picker__swatch leaf-color-picker__swatch--large"
            aria-hidden="true"
          >
            <i style={{ background: previewColor }} />
          </span>
          <div>
            <input
              type="range"
              className="leaf-color-picker__hue"
              min={0}
              max={359}
              value={Math.round(activeHsv.h)}
              aria-label={messages.hue}
              onChange={(event) => change({ ...activeHsv, h: Number(event.target.value) })}
              onPointerUp={() => onChangeComplete?.(latest.current)}
              onKeyUp={() => onChangeComplete?.(latest.current)}
            />
            {!disableAlpha && (
              <input
                type="range"
                className="leaf-color-picker__alpha"
                min={0}
                max={100}
                value={Math.round(activeHsv.a * 100)}
                aria-label={messages.alpha}
                style={{ '--leaf-alpha-color': opaqueColor } as CSSProperties}
                onChange={(event) => change({ ...activeHsv, a: Number(event.target.value) / 100 })}
                onPointerUp={() => onChangeComplete?.(latest.current)}
                onKeyUp={() => onChangeComplete?.(latest.current)}
              />
            )}
          </div>
        </div>
        <fieldset className="leaf-color-picker__formats" aria-label={messages.colorValue}>
          {(['hex', 'rgb', 'hsl'] as const).map((next) => (
            <button
              type="button"
              key={next}
              aria-pressed={format === next}
              onClick={() => {
                if (formatProp === undefined) setFormat(next);
                onFormatChange?.(next);
              }}
            >
              {next.toUpperCase()}
            </button>
          ))}
        </fieldset>
        <input
          className="leaf-color-picker__input"
          aria-label={messages.colorValue}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setInvalid(false);
          }}
          onBlur={chooseText}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              chooseText();
            }
          }}
        />
        {invalid && (
          <span className="leaf-color-picker__error" id={`${id}-error`}>
            {messages.invalidColor}
          </span>
        )}
        {(
          presets ?? [
            {
              label: messages.presets,
              colors: [
                '#20834a',
                '#13a8a8',
                '#1677ff',
                '#7654c6',
                '#ffc53d',
                '#f49b23',
                '#ef5350',
                '#203329',
              ],
            },
          ]
        ).map((group, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Preset groups are static descriptions supplied by the consumer.
          <div className="leaf-color-picker__presets" key={index}>
            <div className="leaf-color-picker__preset-label">{group.label}</div>
            <div>
              {[...new Set(group.colors)].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className="leaf-color-picker__preset"
                  aria-label={preset}
                  aria-pressed={
                    new TinyColor(preset).toHex8String() === new TinyColor(activeHsv).toHex8String()
                  }
                  style={{
                    background: preset,
                    color: new TinyColor(preset).isLight() ? '#203329' : '#fff',
                  }}
                  onClick={() => change(new TinyColor(preset).toHsv(), true)}
                >
                  {new TinyColor(preset).toHex8String() ===
                    new TinyColor(activeHsv).toHex8String() && (
                    <Check size={12} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </FloatingPanel>
    </>
  );
}

export function ColorPicker(props: ColorPickerProps) {
  return props.mode === 'gradient' || props.gradient ? (
    <GradientColorPicker {...props} />
  ) : (
    <SolidColorPicker {...props} />
  );
}
