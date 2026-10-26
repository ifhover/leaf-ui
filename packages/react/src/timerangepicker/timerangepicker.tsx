import { Clock3 } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { pickerSegments, timeDate } from '../shared/segments';
import {
  displayTime,
  parseTime,
  type TimeParts,
  timeInRange,
  timePrecision,
  timeString,
} from '../shared/time';
import { useText } from '../shared/use-text';
import { TimePanel } from '../timepicker/time-panel';
export type TimeRange = readonly [string, string];
export interface TimeRangePickerModeProps extends PickerFieldProps {
  picker: 'time';
  value?: TimeRange | null;
  defaultValue?: TimeRange | null;
  onChange?: (value: TimeRange | null) => void;
  onOpenChange?: (open: boolean) => void;
  showSeconds?: boolean;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  allowOvernight?: boolean;
  /** Earliest selectable time for both endpoints, inclusive, as `HH:mm` or `HH:mm:ss`. */
  minTime?: string;
  /** Latest selectable time for both endpoints, inclusive, as `HH:mm` or `HH:mm:ss`. */
  maxTime?: string;
  /** Require OK or Enter to commit; dismissing otherwise discards the draft. */
  needConfirm?: boolean;
  disabledTime?: (parts: TimeParts, position: 'start' | 'end') => boolean;
}
const startTime: TimeParts = { hour: 9, minute: 0, second: 0 };
const endTime: TimeParts = { hour: 18, minute: 0, second: 0 };
export const TimeRangeInput = forwardRef<HTMLInputElement, TimeRangePickerModeProps>(
  function TimeRangeInput(rawProps: TimeRangePickerModeProps, ref) {
    const {
      picker: _picker,
      value,
      defaultValue = null,
      onChange,
      onOpenChange,
      open: controlledOpen,
      defaultOpen,
      showSeconds = false,
      use12Hours = false,
      minuteStep = 1,
      secondStep = 1,
      allowOvernight = false,
      minTime,
      maxTime,
      needConfirm = false,
      disabledTime,
      ...props
    } = rawProps;
    const t = useText();
    const field = useFormField();
    const { messages } = useLeafConfig();
    const trigger = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const [open, setOpen] = usePopupState(
      props.disabled || field?.disabled || props.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const [draft, setDraft] = useState<readonly [TimeParts, TimeParts]>([startTime, endTime]);
    const [active, setActive] = useState<0 | 1>(0);
    const [validText, setValidText] = useState(true);
    const [fieldDraft, setFieldDraft] = useState<readonly [TimeParts, TimeParts] | null>(null);
    const touched = useRef(false);
    const lower = parseTime(minTime);
    const upper = parseTime(maxTime);
    const clamp = (parts: TimeParts) =>
      lower && !timeInRange(parts, lower)
        ? lower
        : upper && !timeInRange(parts, null, upper)
          ? upper
          : parts;
    const valid = (source: readonly [TimeParts, TimeParts]) => {
      const range = source.map((parts) => timePrecision(parts, showSeconds)) as [
        TimeParts,
        TimeParts,
      ];
      return (
        (allowOvernight || timeString(range[0], true) <= timeString(range[1], true)) &&
        timeInRange(range[0], lower, upper) &&
        timeInRange(range[1], lower, upper) &&
        !disabledTime?.(range[0], 'start') &&
        !disabledTime?.(range[1], 'end')
      );
    };
    const format = (parts: TimeParts) =>
      displayTime(parts, showSeconds, use12Hours, [messages.timePicker.am, messages.timePicker.pm]);
    const change = (parts: readonly [TimeParts, TimeParts] | null) => {
      if (!parts && !selected) return;
      if (props.disabled || field?.disabled || props.readOnly || (parts && !valid(parts))) return;
      const next = parts
        ? ([timeString(parts[0], showSeconds), timeString(parts[1], showSeconds)] as const)
        : null;
      setSelected(next);
      onChange?.(next);
    };
    const parseRange = (text: string): readonly [TimeParts, TimeParts] | null => {
      const pair = text.split(/\s*[~～–—]\s*/);
      if (pair.length !== 2) return null;
      const periods = [messages.timePicker.am, messages.timePicker.pm] as const;
      const first = parseTime(pair[0], periods);
      const second = parseTime(pair[1], periods);
      return first && second
        ? [timePrecision(first, showSeconds), timePrecision(second, showSeconds)]
        : null;
    };
    const first = open && fieldDraft ? fieldDraft[0] : parseTime(selected?.[0]);
    const second = open && fieldDraft ? fieldDraft[1] : parseTime(selected?.[1]);
    return (
      <DateInput
        {...props}
        ref={merged}
        className={[
          'leaf-time-range-picker',
          (showSeconds || use12Hours) && 'leaf-time-range-picker--extended',
          props.className,
        ]
          .filter(Boolean)
          .join(' ')}
        segments={pickerSegments(
          'time',
          undefined,
          [first ? timeDate(first) : null, second ? timeDate(second) : null],
          showSeconds,
          use12Hours,
          minuteStep,
          secondStep,
        )}
        placeholder={props.placeholder ?? t('timeRangePicker.placeholder')}
        icon={<Clock3 size={16} aria-hidden="true" />}
        panelLabel={t('timeRangePicker.label')}
        clearLabel={t('timeRangePicker.clear')}
        displayValue={first && second ? `${format(first)} ~ ${format(second)}` : ''}
        formValue={
          selected && first && second
            ? selected
                .map((text) => {
                  const parts = parseTime(text);
                  return parts ? timeString(parts, showSeconds) : '';
                })
                .join('/')
            : ''
        }
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          touched.current = false;
          setDraft([first ?? clamp(startTime), second ?? clamp(endTime)]);
          setFieldDraft(null);
          setActive(0);
          setValidText(true);
        }}
        onDismiss={() => {
          if (touched.current && !needConfirm && validText && valid(draft)) change(draft);
        }}
        onClear={() => {
          change(null);
          setFieldDraft(null);
          touched.current = false;
          setValidText(true);
        }}
        commitOnBlur={!needConfirm}
        onPanelConfirm={() => {
          if (!validText || !valid(draft)) return false;
          change(draft);
          return true;
        }}
        onTextChange={(text) => {
          const next = parseRange(text);
          setValidText(Boolean(next && valid(next)));
          if (next) setDraft(next);
        }}
        onTextCommit={(text) => {
          if (!text) {
            change(null);
            return true;
          }
          const next = parseRange(text);
          if (!next || !valid(next)) return false;
          change(next);
          return true;
        }}
        panelClassName="leaf-time-range-picker__panel"
        renderPanel={(close) => (
          <>
            <div className="leaf-time-range-picker__panels">
              {([0, 1] as const).map((index) => (
                <fieldset key={index} onFocusCapture={() => setActive(index)}>
                  <legend>{index === 0 ? messages.common.start : messages.common.end}</legend>
                  <TimePanel
                    disabledTime={(parts) => !!disabledTime?.(parts, index === 0 ? 'start' : 'end')}
                    minTime={lower}
                    maxTime={upper}
                    value={draft[index]}
                    onChange={(next) => {
                      touched.current = true;
                      setActive(index);
                      const range =
                        index === 0 ? ([next, draft[1]] as const) : ([draft[0], next] as const);
                      setDraft(range);
                      setFieldDraft(range);
                      setValidText(true);
                    }}
                    minuteStep={minuteStep}
                    secondStep={secondStep}
                    showSeconds={showSeconds}
                    use12Hours={use12Hours}
                    startTime={index === 1 ? draft[0] : undefined}
                    allowOvernight={allowOvernight}
                  />
                </fieldset>
              ))}
            </div>
            <div className="leaf-picker-footer">
              <ButtonControl
                variant="outline"
                size="sm"
                disabled={
                  !timeInRange(
                    { hour: new Date().getHours(), minute: new Date().getMinutes(), second: 0 },
                    lower,
                    upper,
                  )
                }
                onClick={() => {
                  const now = new Date();
                  const next = {
                    hour: now.getHours(),
                    minute: now.getMinutes(),
                    second: showSeconds ? now.getSeconds() : 0,
                  };
                  touched.current = true;
                  const range =
                    active === 0 ? ([next, draft[1]] as const) : ([draft[0], next] as const);
                  setDraft(range);
                  setFieldDraft(range);
                  setValidText(true);
                }}
              >
                {messages.timePicker.now}
              </ButtonControl>
              <ButtonControl
                size="sm"
                variant="solid"
                disabled={!validText || !valid(draft)}
                onClick={() => {
                  change(draft);
                  close();
                }}
              >
                {messages.common.confirm}
              </ButtonControl>
            </div>
          </>
        )}
      />
    );
  },
);
