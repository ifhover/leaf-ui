import { TinyColor } from '@ctrl/tinycolor';
import { Plus, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { defaultColors } from '../colors';
import { useLeafConfig } from '../config-provider/context';
import { FieldScope, useFormField } from '../form/form';
import { InputNumberControl as InputNumber } from '../inputnumber/inputnumber';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import { FloatingPanel, useFloatingDismiss, usePopupState } from '../shared/floating';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import { SliderControl as Slider } from '../slider/slider';
import { type ColorPickerProps, SolidColorPicker } from './colorpicker';
export interface ColorGradientStop {
  key?: string;
  color: string;
  offset: number;
}
export interface ColorGradient {
  angle: number;
  stops: readonly ColorGradientStop[];
}
export function gradientString({ angle, stops }: ColorGradient) {
  return `linear-gradient(${angle}deg, ${[...stops]
    .sort((a, b) => a.offset - b.offset)
    .map((stop) => `${stop.color} ${stop.offset}%`)
    .join(', ')})`;
}
export function parseGradient(value: string): ColorGradient | null {
  const match = value.match(/^linear-gradient\(\s*([+-]?[\d.]+)deg\s*,([\s\S]+)\)$/i);
  if (!match) return null;
  const pieces = (match[2] ?? '').split(/,(?![^()]*\))/);
  const stops: ColorGradientStop[] = [];
  for (const piece of pieces) {
    const stop = piece.trim().match(/^(.+?)\s+([\d.]+)%$/);
    if (!stop || !new TinyColor(stop[1]).isValid) return null;
    stops.push({ color: stop[1] ?? '', offset: Math.min(100, Math.max(0, Number(stop[2]))) });
  }
  const angle = Number(match[1]);
  return stops.length >= 2 && Number.isFinite(angle) ? { angle, stops } : null;
}
const defaultGradient: ColorGradient = {
  angle: 90,
  stops: [
    { color: defaultColors.light.primary, offset: 0 },
    { color: defaultColors.dark.primary, offset: 100 },
  ],
};
const initial = gradientString(defaultGradient);
export function GradientColorPicker({
  value,
  defaultValue = initial,
  onChange,
  onChangeComplete,
  size = 'md',
  disabled: disabledProp,
  readOnly,
  allowClear = false,
  status: statusProp,
  format,
  defaultFormat,
  onFormatChange,
  disableAlpha,
  presets,
  gradient: _gradient,
  mode: _mode,
  name,
  form,
  required,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  popupWidth = 300,
  popupClassName,
  popupStyle,
  popupRender,
  popupPlacement,
  getPopupContainer,
  showText,
  className,
  style,
  id,
  ...props
}: ColorPickerProps) {
  const field = useFormField(),
    { messages } = useLeafConfig(),
    t = useText();
  const formatText = useFormattedText();
  const disabled = disabledProp || field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const trigger = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null),
    root = useRef<HTMLSpanElement>(null);
  const panelId = useId();
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const [open, setOpen] = usePopupState(
      disabled || readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    ),
    [active, setActive] = useState(0);
  const serial = useRef(0);
  const cache = useRef<{ value: string; model: ColorGradient } | null>(null);
  if (cache.current?.value !== current)
    cache.current = {
      value: current,
      model: {
        ...(parseGradient(current) ?? defaultGradient),
        stops: (parseGradient(current) ?? defaultGradient).stops.map((stop) => ({
          ...stop,
          key: `${panelId}-${++serial.current}`,
        })),
      },
    };
  const model = cache.current.model;
  const selected = model.stops[Math.min(active, model.stops.length - 1)] ??
    defaultGradient.stops[0] ?? { color: defaultColors.light.primary, offset: 0 };
  const change = (next: ColorGradient, complete = false) => {
    if (disabled || readOnly) return;
    const text = gradientString(next);
    cache.current = { value: text, model: next };
    setCurrent(text);
    if (text !== current) onChange?.(text);
    if (complete) onChangeComplete?.(text);
  };
  const changeStop = (patch: Partial<ColorGradientStop>, complete = false) =>
    change(
      {
        ...model,
        stops: model.stops.map((stop, index) =>
          index === Math.min(active, model.stops.length - 1) ? { ...stop, ...patch } : stop,
        ),
      },
      complete,
    );
  useFloatingDismiss(open, () => setOpen(false), trigger, panel, root);
  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Pointer events on the outer row forward to the keyboard-accessible trigger button. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: The enclosed native button owns keyboard interaction; this wrapper only extends its hit area. */}
      <span
        ref={root}
        className={classes('leaf-color-picker', `leaf-color-picker--${size}`, className)}
        style={style}
        data-status={status}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-open={open || undefined}
        onMouseDown={(event) => {
          if (!disabled && event.target === event.currentTarget) event.preventDefault();
        }}
        onClick={(event) => {
          if (disabled || event.defaultPrevented || event.target !== event.currentTarget) return;
          event.preventDefault();
          event.stopPropagation();
          trigger.current?.focus();
          trigger.current?.click();
        }}
      >
        <button
          {...props}
          ref={trigger}
          type={props.type ?? 'button'}
          form={form}
          id={id ?? field?.id}
          disabled={disabled}
          aria-label={
            props['aria-label'] ?? (field?.labelId ? undefined : messages.colorPicker.label)
          }
          aria-labelledby={props['aria-labelledby'] ?? field?.labelId}
          aria-describedby={
            [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={status === 'error' || props['aria-invalid']}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? panelId : undefined}
          className="leaf-color-picker__trigger"
          onClick={(event) => {
            props.onClick?.(event);
            if (!event.defaultPrevented) setOpen(!open);
          }}
        >
          <span className="leaf-color-picker__swatch" aria-hidden="true">
            <i style={{ background: current || 'transparent' }} />
          </span>
          {showText && (
            <span className="leaf-color-picker__text">
              {typeof showText === 'function'
                ? showText(current)
                : current
                  ? t('colorPicker.gradient')
                  : messages.colorPicker.label}
            </span>
          )}
        </button>
        {allowClear && current && !disabled && !readOnly && (
          <button
            type="button"
            className="leaf-color-picker__clear"
            aria-label={messages.colorPicker.clear}
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
          name={name}
          form={form}
          value={current}
          required={required ?? field?.required}
          disabled={disabled}
          triggerRef={trigger}
        />
      </span>
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        width={popupWidth}
        id={panelId}
        role="dialog"
        aria-label={messages.colorPicker.label}
        className={['leaf-floating', 'leaf-color-picker__gradient', popupClassName]
          .filter(Boolean)
          .join(' ')}
        style={popupStyle}
        render={popupRender}
        placement={popupPlacement}
        container={getPopupContainer}
      >
        <FieldScope>
          <div className="leaf-color-picker__gradient-preview" style={{ background: current }} />
          <div className="leaf-color-picker__stops">
            {model.stops.map((stop, index) => (
              <button
                key={stop.key}
                type="button"
                aria-label={formatText('colorPicker.colorStop', { index: index + 1 })}
                aria-pressed={active === index}
                style={{ background: stop.color }}
                onClick={() => setActive(index)}
              />
            ))}
            <ButtonControl
              size="sm"
              variant="ghost"
              aria-label={t('colorPicker.addColorStop')}
              startIcon={<Plus size={14} />}
              disabled={model.stops.length >= 10}
              onClick={() => {
                change(
                  {
                    ...model,
                    stops: [
                      ...model.stops,
                      { color: selected.color, offset: 50, key: `${panelId}-${++serial.current}` },
                    ],
                  },
                  true,
                );
                setActive(model.stops.length);
              }}
            />
            <ButtonControl
              size="sm"
              variant="ghost"
              aria-label={t('colorPicker.removeColorStop')}
              startIcon={<X size={14} />}
              disabled={model.stops.length <= 2}
              onClick={() => {
                change(
                  { ...model, stops: model.stops.filter((_, index) => index !== active) },
                  true,
                );
                setActive(0);
              }}
            />
          </div>
          <div className="leaf-color-picker__gradient-field">
            <span>{t('colorPicker.color')}</span>
            <SolidColorPicker
              value={selected.color}
              onChange={(color) => changeStop({ color })}
              onChangeComplete={(color) => changeStop({ color }, true)}
              showText
              disableAlpha={disableAlpha}
              presets={presets}
              format={format}
              defaultFormat={defaultFormat}
              onFormatChange={onFormatChange}
            />
          </div>
          <div className="leaf-color-picker__gradient-field">
            <span>{t('colorPicker.position')}</span>
            <Slider
              aria-label={t('colorPicker.colorStopPosition')}
              value={selected.offset}
              onChange={(offset) => changeStop({ offset })}
              onChangeComplete={() => onChangeComplete?.(current)}
            />
          </div>
          <div className="leaf-color-picker__gradient-field">
            <span>{t('colorPicker.angle')}</span>
            <InputNumber
              aria-label={t('colorPicker.gradientAngle')}
              min={0}
              max={360}
              value={model.angle}
              onChange={(angle) => {
                if (angle !== null) change({ ...model, angle }, true);
              }}
              suffix="°"
            />
          </div>
        </FieldScope>
      </FloatingPanel>
    </>
  );
}
