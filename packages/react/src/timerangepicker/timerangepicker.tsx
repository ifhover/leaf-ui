import { Clock3 } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/context';
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
  function TimeRangePicker(
    {
      value,
      defaultValue = null,
      onChange,
      onOpenChange,
      showSeconds = false,
      use12Hours = false,
      minuteStep = 5,
      secondStep = 1,
      allowOvernight = false,
      disabledTime,
      ...props
    },
    ref,
  ) {
    const t = useText();
    const { messages } = useLeafConfig();
    const trigger = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const [open, setOpen] = usePopupState(props.disabled, onOpenChange);
    const [draft, setDraft] = useState<readonly [TimeParts, TimeParts]>([startTime, endTime]);
    const [active, setActive] = useState<0 | 1>(0);
    const [validText, setValidText] = useState(true);
    const valid = (range: readonly [TimeParts, TimeParts]) =>
      (allowOvernight || timeString(range[0], true) <= timeString(range[1], true)) &&
      !disabledTime?.(range[0], 'start') &&
      !disabledTime?.(range[1], 'end');
    const format = (parts: TimeParts) =>
      displayTime(parts, showSeconds, use12Hours, [messages.am, messages.pm]);
    const change = (parts: readonly [TimeParts, TimeParts] | null) => {
      const next = parts
        ? ([timeString(parts[0], showSeconds), timeString(parts[1], showSeconds)] as const)
        : null;
      setSelected(next);
      onChange?.(next);
    };
    const parseRange = (text: string): readonly [TimeParts, TimeParts] | null => {
      const pair = text.split(/\s*[~～–—]\s*/);
      if (pair.length !== 2) return null;
      const first = parseTime(pair[0]);
      const second = parseTime(pair[1]);
      return first && second ? [first, second] : null;
    };
    const first = parseTime(selected?.[0]);
    const second = parseTime(selected?.[1]);
    return (
      <DateInput
        {...props}
        ref={merged}
        placeholder={props.placeholder ?? t('开始时间 ～ 结束时间', 'Start time ~ End time')}
        icon={<Clock3 size={16} aria-hidden="true" />}
        panelLabel={t('选择时间范围', 'Choose time range')}
        clearLabel={t('清除时间范围', 'Clear time range')}
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
            <div className="leaf-time-range-picker__tabs">
              <Button
                size="sm"
                variant={active === 0 ? 'soft' : 'ghost'}
                onClick={() => setActive(0)}
              >
                {messages.start}: {format(draft[0])}
              </Button>
              <span>~</span>
              <Button
                size="sm"
                variant={active === 1 ? 'soft' : 'ghost'}
                onClick={() => setActive(1)}
              >
                {messages.end}: {format(draft[1])}
              </Button>
            </div>
            <TimePanel
              value={draft[active]}
              onChange={(next) => {
                setDraft((previous) => (active === 0 ? [next, previous[1]] : [previous[0], next]));
                setValidText(true);
              }}
              minuteStep={minuteStep}
              secondStep={secondStep}
              showSeconds={showSeconds}
              use12Hours={use12Hours}
            />
            <div className="leaf-picker-footer">
              <Button
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
                {messages.now}
              </Button>
              <Button
                size="sm"
                disabled={!validText || !valid(draft)}
                onClick={() => {
                  change(draft);
                  close();
                }}
              >
                {messages.confirm}
              </Button>
            </div>
          </>
        )}
      />
    );
  },
);
