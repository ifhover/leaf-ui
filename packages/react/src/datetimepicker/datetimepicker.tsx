import { forwardRef, type ReactNode, useRef, useState } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { CalendarPanel, dateTimeKey } from '../shared/calendar';
import { dateKey } from '../shared/date';
import {
  type DateFormat,
  type DatePreset,
  formatPickerDate,
  parsePickerDate,
} from '../shared/date-format';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { parseDateText } from '../shared/parse-date';
import { useContentTransition } from '../shared/presence';
import { displayTime, type TimeParts } from '../shared/time';
import { TimePanel } from '../timepicker/time-panel';

export interface DateTimePickerProps extends PickerFieldProps {
  value?: Date | null;
  defaultValue?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  use12Hours?: boolean;
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  showToday?: boolean;
  todayText?: ReactNode;
  renderExtraFooter?: ReactNode;
  onChange?: (value: Date | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabledDate?: (date: Date) => boolean;
  disabledTime?: (parts: TimeParts, date: Date) => boolean;
  format?: DateFormat;
  parse?: (text: string) => Date | null;
  presets?: readonly DatePreset[];
  panelValue?: Date;
  onPanelChange?: (date: Date) => void;
  cellRender?: (date: Date) => ReactNode;
}
export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      defaultValue = null,
      minDate,
      maxDate,
      use12Hours = false,
      showSeconds = true,
      minuteStep = 1,
      secondStep = 1,
      showToday = true,
      todayText,
      renderExtraFooter,
      onChange,
      onOpenChange,
      open: controlledOpen,
      defaultOpen,
      disabledDate,
      disabledTime,
      format,
      parse,
      presets,
      panelValue,
      onPanelChange,
      cellRender,
      ...props
    },
    ref,
  ) {
    const { messages } = useLeafConfig();
    const field = useFormField();
    const trigger = useRef<HTMLInputElement>(null);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const merged = useMergedRef(trigger, ref);
    const [open, setOpen] = usePopupState(
      props.disabled || field?.disabled || props.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const [draft, setDraft] = useState(selected ?? new Date());
    const [view, setView] = useState<'date' | 'time'>('date');
    const panelView = useRef<HTMLDivElement>(null);
    useContentTransition(panelView, `${open}:${view}`, view === 'time' ? 1 : -1);
    const [focusCalendar, setFocusCalendar] = useState(false);
    const [validText, setValidText] = useState(true);
    const normalize = (date: Date) => {
      const next = new Date(date);
      next.setMilliseconds(0);
      if (!showSeconds) next.setSeconds(0);
      return next;
    };
    const inBounds = (date: Date) =>
      Number.isFinite(date.getTime()) &&
      (!minDate || date >= minDate) &&
      (!maxDate || date <= maxDate) &&
      !disabledDate?.(date) &&
      !disabledTime?.(parts(date), date);
    const change = (next: Date | null) => {
      if (props.readOnly || props.disabled || field?.disabled || (next && !inBounds(next))) return;
      const normalized = next ? normalize(next) : null;
      setSelected(normalized);
      onChange?.(
        normalized,
        normalized
          ? formatPickerDate(normalized, format, (date) => dateTimeKey(date, showSeconds))
          : '',
      );
    };
    const parts = (date: Date): TimeParts => ({
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    });
    const timeLabel = (date: Date) =>
      displayTime(parts(date), showSeconds, use12Hours, [messages.am, messages.pm]);
    const label = (date: Date) =>
      formatPickerDate(date, format, (date) => `${dateKey(date)} ${timeLabel(date)}`);
    const today = new Date();
    today.setHours(draft.getHours(), draft.getMinutes(), showSeconds ? draft.getSeconds() : 0, 0);
    const updateTime = (time: TimeParts) => {
      const next = new Date(draft);
      next.setHours(time.hour, time.minute, showSeconds ? time.second : 0, 0);
      setDraft(next);
      setValidText(true);
    };
    return (
      <DateInput
        {...props}
        ref={merged}
        placeholder={props.placeholder ?? messages.dateTime}
        commitOnBlur={false}
        displayValue={selected ? label(selected) : ''}
        formValue={selected ? dateTimeKey(selected, showSeconds) : ''}
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          let next = new Date(selected ?? new Date());
          if (minDate && next < minDate) next = new Date(minDate);
          if (maxDate && next > maxDate) next = new Date(maxDate);
          setDraft(normalize(next));
          setView('date');
          setFocusCalendar(false);
          setValidText(true);
        }}
        onClear={() => change(null)}
        onTextChange={(text) => {
          const next = parsePickerDate(
            text.trim(),
            format,
            (text) => parseDateText(text, 'datetime'),
            parse,
          );
          setValidText(Boolean(next && inBounds(normalize(next))));
          if (next) setDraft(normalize(next));
        }}
        onTextCommit={(text) => {
          if (!text) {
            change(null);
            return true;
          }
          const next = parsePickerDate(
            text,
            format,
            (text) => parseDateText(text, 'datetime'),
            parse,
          );
          if (!next || !inBounds(normalize(next))) return false;
          change(next);
          return true;
        }}
        panelClassName="leaf-datetime-panel"
        renderPanel={(close) => (
          <>
            <div ref={panelView} className="leaf-picker-view">
              {view === 'date' ? (
                <CalendarPanel
                  disabledDate={disabledDate}
                  cellRender={cellRender}
                  visibleDate={panelValue}
                  onVisibleChange={onPanelChange}
                  value={draft}
                  picker="datetime"
                  autoFocus={focusCalendar}
                  minDate={minDate}
                  maxDate={maxDate}
                  headerExtra={
                    <button
                      type="button"
                      className="leaf-picker-time-toggle"
                      aria-label={messages.selectTime}
                      onClick={() => {
                        setFocusCalendar(false);
                        setView('time');
                      }}
                    >
                      {timeLabel(draft)}
                    </button>
                  }
                  onChange={(date) => {
                    const next = new Date(date);
                    const time = parts(draft);
                    next.setHours(time.hour, time.minute, showSeconds ? time.second : 0, 0);
                    setDraft(next);
                    setValidText(true);
                  }}
                />
              ) : (
                <div className="leaf-picker-time-view">
                  <div className="leaf-picker-time-view__header">
                    <button
                      type="button"
                      className="leaf-picker-time-toggle"
                      aria-label={messages.selectDate}
                      onClick={() => {
                        setFocusCalendar(true);
                        setView('date');
                      }}
                    >
                      {dateKey(draft)}
                    </button>
                    <span>{timeLabel(draft)}</span>
                  </div>
                  <TimePanel
                    disabledTime={(parts) => !!disabledTime?.(parts, draft)}
                    autoFocus
                    value={parts(draft)}
                    onChange={updateTime}
                    showSeconds={showSeconds}
                    use12Hours={use12Hours}
                    minuteStep={minuteStep}
                    secondStep={secondStep}
                  />
                </div>
              )}
            </div>
            {presets?.length ? (
              <div className="leaf-picker-presets">
                {presets.map((preset) => (
                  <Button
                    key={preset.key ?? String(preset.label)}
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const date =
                        typeof preset.value === 'function' ? preset.value() : preset.value;
                      if (inBounds(date)) {
                        change(date);
                        close();
                      }
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            ) : null}
            <div className="leaf-picker-footer">
              <div className="leaf-picker-footer__extra">
                {showToday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!inBounds(today)}
                    onClick={() => {
                      setDraft(today);
                      setValidText(true);
                      setView('date');
                    }}
                  >
                    {todayText ?? messages.today}
                  </Button>
                )}
                {view === 'time' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraft(normalize(new Date()));
                      setValidText(true);
                    }}
                  >
                    {messages.now}
                  </Button>
                )}
                {renderExtraFooter}
              </div>
              <Button
                size="sm"
                disabled={!validText || !inBounds(draft)}
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
DateTimePicker.displayName = 'DateTimePicker';
