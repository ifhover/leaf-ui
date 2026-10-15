import { Clock3 } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { displayTime, parseTime, type TimeParts, timeString } from '../shared/time';
import { useText } from '../shared/use-text';
import { TimePanel } from '../timepicker/time-panel';
export type TimeRange = readonly [string, string];
export interface TimeRangePickerProps extends PickerFieldProps {
  value?: TimeRange | null;
  defaultValue?: TimeRange | null;
  onChange?: (value: TimeRange | null) => void;
  onOpenChange?: (open: boolean) => void;
  showSeconds?: boolean;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  allowOvernight?: boolean;
  disabledTime?: (parts: TimeParts, position: 'start' | 'end') => boolean;
}
const startTime: TimeParts = { hour: 9, minute: 0, second: 0 };
const endTime: TimeParts = { hour: 18, minute: 0, second: 0 };
export const TimeRangePicker = forwardRef<HTMLInputElement, TimeRangePickerProps>(
  function TimeRangePicker(rawProps: TimeRangePickerProps, ref) {
    const {
      value,
      defaultValue = null,
      onChange,
      onOpenChange,
      open: controlledOpen,
      defaultOpen,
      showSeconds = false,
      use12Hours = false,
      minuteStep = 5,
      secondStep = 1,
      allowOvernight = false,
      disabledTime,
      ...props
    } = useComponentProps('TimeRangePicker', rawProps);
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
    const valid = (range: readonly [TimeParts, TimeParts]) =>
      (allowOvernight || timeString(range[0], true) <= timeString(range[1], true)) &&
      !disabledTime?.(range[0], 'start') &&
      !disabledTime?.(range[1], 'end');
    const format = (parts: TimeParts) =>
      displayTime(parts, showSeconds, use12Hours, [messages.timePicker.am, messages.timePicker.pm]);
    const change = (parts: readonly [TimeParts, TimeParts] | null) => {
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
      return first && second ? [first, second] : null;
    };
    const first = parseTime(selected?.[0]);
    const second = parseTime(selected?.[1]);
    return (
      <DateInput
        {...props}
        ref={merged}
        placeholder={props.placeholder ?? t('timeRangePicker.placeholder')}
        icon={<Clock3 size={16} aria-hidden="true" />}
        panelLabel={t('timeRangePicker.label')}
        clearLabel={t('timeRangePicker.clear')}
        displayValue={first && second ? `${format(first)} ~ ${format(second)}` : ''}
        formValue={selected ? selected.join('/') : ''}
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          setDraft([first ?? startTime, second ?? endTime]);
          setActive(0);
          setValidText(true);
        }}
        onClear={() => change(null)}
        commitOnBlur={false}
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
                    value={draft[index]}
                    onChange={(next) => {
                      setActive(index);
                      setDraft((previous) =>
                        index === 0 ? [next, previous[1]] : [previous[0], next],
                      );
                      setValidText(true);
                    }}
                    minuteStep={minuteStep}
                    secondStep={secondStep}
                    showSeconds={showSeconds}
                    use12Hours={use12Hours}
                  />
                </fieldset>
              ))}
            </div>
            <div className="leaf-picker-footer">
              <ButtonControl
                variant="ghost"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const next = {
                    hour: now.getHours(),
                    minute: now.getMinutes(),
                    second: now.getSeconds(),
                  };
                  setDraft((previous) =>
                    active === 0 ? [next, previous[1]] : [previous[0], next],
                  );
                  setValidText(true);
                }}
              >
                {messages.timePicker.now}
              </ButtonControl>
              <ButtonControl
                size="sm"
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
