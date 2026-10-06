import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import type { LeafThemeStyle } from '../theme';
import { Tooltip } from '../tooltip';

export interface SliderMark {
  value: number;
  label?: ReactNode;
}
interface SliderBaseProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'step'
  > {
  min?: number;
  max?: number;
  step?: number | null;
  marks?: readonly SliderMark[];
  vertical?: boolean;
  showValue?: boolean;
  onChangeComplete?: (value: number | readonly [number, number]) => void;
  tooltip?: boolean | { formatter?: (value: number) => ReactNode };
}
export type SliderProps = SliderBaseProps &
  (
    | { range?: false; value?: number; defaultValue?: number; onChange?: (value: number) => void }
    | {
        range: true;
        value?: readonly [number, number];
        defaultValue?: readonly [number, number];
        onChange?: (value: [number, number]) => void;
      }
  );
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  function Slider(props, forwardedRef) {
    const {
      range = false,
      value,
      defaultValue,
      onChange: _onChange,
      min = 0,
      max = 100,
      step = 1,
      marks = [],
      vertical = false,
      showValue = false,
      onChangeComplete,
      tooltip = false,
      disabled: disabledProp,
      readOnly,
      className,
      style,
      name,
      id: idProp,
      onKeyDown,
      onKeyUp,
      onPointerUp,
      onBlur,
      'aria-label': label,
      ...inputProps
    } = props;
    const { messages, direction } = useLeafConfig();
    const [activeThumb, setActiveThumb] = useState<number | null>(null);
    const field = useFormField();
    const generatedId = useId();
    const disabled = disabledProp || field?.disabled;
    const minimum = Number.isFinite(min) ? min : 0;
    const maximum = Math.max(minimum, Number.isFinite(max) ? max : 100);
    const increment = step !== null && Number.isFinite(step) && step > 0 ? step : 1;
    const positions = [
      ...new Set(
        marks.map((mark) => mark.value).filter((value) => value >= minimum && value <= maximum),
      ),
    ].sort((a, b) => a - b);
    const clamp = (number: number) =>
      Math.min(maximum, Math.max(minimum, Number.isFinite(number) ? number : minimum));
    const snap = (number: number) =>
      step === null && positions.length
        ? positions.reduce(
            (best, value) => (Math.abs(value - number) < Math.abs(best - number) ? value : best),
            positions[0] ?? minimum,
          )
        : clamp(
            Number((minimum + Math.round((number - minimum) / increment) * increment).toFixed(12)),
          );
    const input = useRef<HTMLInputElement>(null);
    const ref = useMergedRef(input, forwardedRef);
    const second = useRef<HTMLInputElement>(null);
    const [current, setCurrent] = useFieldValue<number | readonly [number, number]>(
      value,
      defaultValue ?? (range ? [minimum, maximum] : minimum),
      input,
      inputProps.form,
    );
    const pair =
      typeof current === 'number'
        ? [minimum, clamp(current)]
        : [clamp(current[0]), clamp(current[1])].sort((a, b) => a - b);
    const low = pair[0] ?? minimum;
    const high = pair[1] ?? maximum;
    const activeRef = useRef<number | readonly [number, number]>(current);
    activeRef.current = range ? [low, high] : high;
    const changed = useRef(false);
    const complete = () => {
      if (changed.current) {
        changed.current = false;
        onChangeComplete?.(activeRef.current);
      }
    };
    const change = (next: number, index: number) => {
      if (disabled || readOnly) return;
      const normalized = snap(next);
      const result: number | [number, number] = range
        ? index === 0
          ? [Math.min(normalized, high), high]
          : [low, Math.max(normalized, low)]
        : normalized;
      if (JSON.stringify(result) === JSON.stringify(activeRef.current)) return;
      activeRef.current = result;
      changed.current = true;
      setCurrent(result);
      if (props.range) props.onChange?.(result as [number, number]);
      else props.onChange?.(result as number);
    };
    const percent = (number: number) =>
      maximum === minimum ? 0 : ((number - minimum) / (maximum - minimum)) * 100;
    return (
      <div
        className={classes(
          'leaf-slider',
          vertical && 'leaf-slider--vertical',
          range && 'leaf-slider--range',
          className,
        )}
        data-disabled={disabled || readOnly ? '' : undefined}
        style={
          {
            '--leaf-slider-start': `${percent(range ? low : minimum)}%`,
            '--leaf-slider-end': `${percent(high)}%`,
            ...style,
          } as LeafThemeStyle
        }
      >
        <div className="leaf-slider__rail">
          <div className="leaf-slider__fill" />
        </div>
        {(range ? [low, high] : [high]).map((number, index) => (
          <input
            {...inputProps}
            key={range ? (index === 0 ? 'start' : 'end') : 'single'}
            ref={index === 0 ? ref : second}
            id={
              index === 0
                ? (idProp ?? field?.id ?? generatedId)
                : `${idProp ?? field?.id ?? generatedId}-end`
            }
            type="range"
            className="leaf-slider__input"
            name={name}
            min={minimum}
            max={maximum}
            step={increment}
            value={number}
            disabled={disabled}
            readOnly={readOnly}
            aria-readonly={readOnly || undefined}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            aria-label={
              range
                ? `${label ?? messages.slider} ${index === 0 ? messages.start : messages.end}`
                : (label ?? (field ? undefined : messages.slider))
            }
            aria-labelledby={range ? undefined : inputProps['aria-labelledby']}
            aria-describedby={
              [inputProps['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') ||
              undefined
            }
            onChange={(event) => change(Number(event.target.value), index)}
            onFocus={() => setActiveThumb(index)}
            onPointerDown={() => setActiveThumb(index)}
            onPointerEnter={() => setActiveThumb(index)}
            onPointerLeave={() => {
              if (
                document.activeElement !== input.current &&
                document.activeElement !== second.current
              )
                setActiveThumb(null);
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented) return;
              let next: number | undefined;
              if (event.key === 'Home') next = step === null ? positions[0] : minimum;
              else if (event.key === 'End') next = step === null ? positions.at(-1) : maximum;
              else if (
                ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown'].includes(
                  event.key,
                )
              )
                next =
                  number +
                  ([direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight', 'ArrowUp', 'PageUp'].includes(
                    event.key,
                  )
                    ? 1
                    : -1) *
                    increment *
                    (event.shiftKey || event.key.startsWith('Page') ? 10 : 1);
              if (next !== undefined) {
                if (step === null && positions.length && !['Home', 'End'].includes(event.key)) {
                  const previous = positions.filter((value) => value < number).at(-1);
                  next =
                    next > number
                      ? (positions.find((value) => value > number) ?? positions.at(-1))
                      : (previous ?? positions[0]);
                }
                event.preventDefault();
                if (next !== undefined) change(next, index);
              }
            }}
            onKeyUp={(event) => {
              onKeyUp?.(event);
              complete();
            }}
            onPointerUp={(event) => {
              onPointerUp?.(event);
              complete();
            }}
            onBlur={(event) => {
              setActiveThumb(null);
              onBlur?.(event);
              complete();
            }}
          />
        ))}
        {tooltip && activeThumb !== null && (
          <Tooltip
            open
            content={
              typeof tooltip === 'object'
                ? (tooltip.formatter?.(activeThumb === 0 && range ? low : high) ??
                  (activeThumb === 0 && range ? low : high))
                : activeThumb === 0 && range
                  ? low
                  : high
            }
          >
            <span
              className="leaf-slider__tooltip-anchor"
              style={
                vertical
                  ? { bottom: `${percent(activeThumb === 0 && range ? low : high)}%` }
                  : { insetInlineStart: `${percent(activeThumb === 0 && range ? low : high)}%` }
              }
            />
          </Tooltip>
        )}
        {showValue && (
          <output className="leaf-slider__value" aria-hidden="true">
            {range ? `${low} – ${high}` : high}
          </output>
        )}
        {marks
          .filter((mark) => mark.value >= minimum && mark.value <= maximum)
          .map((mark) => (
            <button
              type="button"
              className="leaf-slider__mark"
              data-active={
                mark.value >= (range ? low : minimum) && mark.value <= high ? '' : undefined
              }
              key={mark.value}
              disabled={disabled || readOnly}
              style={
                vertical
                  ? { bottom: `${percent(mark.value)}%` }
                  : { insetInlineStart: `${percent(mark.value)}%` }
              }
              aria-label={typeof mark.label === 'string' ? mark.label : String(mark.value)}
              onClick={() => {
                change(
                  mark.value,
                  range && Math.abs(mark.value - low) < Math.abs(mark.value - high)
                    ? 0
                    : range
                      ? 1
                      : 0,
                );
                complete();
                input.current?.focus();
              }}
            >
              <span className="leaf-slider__dot" aria-hidden="true" />
              <span>{mark.label ?? mark.value}</span>
            </button>
          ))}
      </div>
    );
  },
);
