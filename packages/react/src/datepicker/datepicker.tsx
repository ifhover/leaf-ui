import { forwardRef, type ReactNode, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import {
  CalendarPanel,
  dateTimeKey,
  periodKey,
  startOfPeriod,
  withinPeriod,
} from '../shared/calendar';
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
import { pickerSegments } from '../shared/segments';
import { displayTime, type TimeParts } from '../shared/time';
import { TimePanel } from '../timepicker/time-panel';
import { TimeInput, type TimePickerModeProps } from '../timepicker/timepicker';

export interface SingleDatePickerProps extends PickerFieldProps {
  value?: Date | null;
  defaultValue?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  picker?: 'date' | 'datetime' | 'year' | 'quarter' | 'month' | 'week';
  disabledDate?: (date: Date) => boolean;
  disabledTime?: (parts: TimeParts, date: Date) => boolean;
  showSeconds?: boolean;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  needConfirm?: boolean;
  showToday?: boolean;
  todayText?: ReactNode;
  renderExtraFooter?: ReactNode;
  onChange?: (value: Date | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;
  format?: DateFormat;
  parse?: (text: string) => Date | null;
  presets?: readonly DatePreset[];
  panelValue?: Date;
  onPanelChange?: (date: Date) => void;
  cellRender?: (date: Date) => ReactNode;
}
const timeParts = (date: Date): TimeParts => ({
  hour: date.getHours(),
  minute: date.getMinutes(),
  second: date.getSeconds(),
});
const SingleDatePicker = forwardRef<HTMLInputElement, SingleDatePickerProps>(
  function SingleDatePicker(
    {
      value,
      defaultValue = null,
      minDate,
      maxDate,
      picker = 'date',
      disabledDate,
      disabledTime,
      showToday = true,
      todayText,
      renderExtraFooter,
      onChange,
      onOpenChange,
      open: controlledOpen,
      defaultOpen,
      format,
      parse: customParse,
      presets,
      panelValue,
      onPanelChange,
      cellRender,
      showSeconds = false,
      use12Hours = false,
      minuteStep = 1,
      secondStep = 1,
      needConfirm = picker === 'datetime',
      ...props
    },
    ref,
  ) {
    const { messages, weekStartsOn } = useLeafConfig();
    const field = useFormField();
    const trigger = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const [open, setOpen] = usePopupState(
      props.disabled || field?.disabled || props.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const datetime = picker === 'datetime';
    const normalize = (date: Date) => {
      const next = startOfPeriod(date, picker, weekStartsOn);
      if (datetime && !showSeconds) next.setSeconds(0);
      return next;
    };
    const [draft, setDraft] = useState<Date | null>(selected);
    const [panelDraft, setPanelDraft] = useState<Date | null>(null);
    const [validText, setValidText] = useState(true);
    const touched = useRef(false);
    const periods = [messages.timePicker.am, messages.timePicker.pm] as const;
    const canonical = (date: Date) =>
      datetime ? dateTimeKey(date, showSeconds) : periodKey(date, picker, weekStartsOn);
    const label = (date: Date) =>
      formatPickerDate(date, format, (date) =>
        datetime
          ? `${periodKey(date, 'date')} ${displayTime(timeParts(date), showSeconds, use12Hours, periods)}`
          : canonical(date),
      );
    const inBounds = (date: Date) =>
      withinPeriod(date, picker, minDate, maxDate, weekStartsOn) &&
      !disabledDate?.(date) &&
      !(datetime && disabledTime?.(timeParts(date), date));
    const change = (next: Date | null) => {
      if (!next && !selected) return;
      const normalized = next ? normalize(next) : null;
      if (
        props.readOnly ||
        props.disabled ||
        field?.disabled ||
        (normalized && !inBounds(normalized))
      )
        return;
      setSelected(normalized);
      onChange?.(normalized, normalized ? formatPickerDate(normalized, format, canonical) : '');
    };
    const parse = (text: string) => {
      const date = parsePickerDate(
        text,
        format,
        (text) => parseDateText(text, picker, periods, weekStartsOn),
        customParse,
      );
      return date ? normalize(date) : null;
    };
    const update = (date: Date) => {
      const next = normalize(date);
      touched.current = true;
      setDraft(next);
      setPanelDraft(next);
      setValidText(true);
    };
    const base = draft ?? selected ?? normalize(new Date());
    const displayed = open && panelDraft ? panelDraft : selected;
    const today = new Date();
    today.setHours(
      datetime ? base.getHours() : 0,
      datetime ? base.getMinutes() : 0,
      datetime && showSeconds ? base.getSeconds() : 0,
      0,
    );
    const confirm = (close: () => void) => {
      if (!draft || !validText || !inBounds(draft)) return;
      change(draft);
      close();
    };
    return (
      <DateInput
        {...props}
        ref={merged}
        className={[
          datetime && (showSeconds || use12Hours) && 'leaf-date-picker--extended',
          props.className,
        ]
          .filter(Boolean)
          .join(' ')}
        segments={pickerSegments(
          picker,
          format,
          [displayed],
          showSeconds,
          use12Hours,
          minuteStep,
          secondStep,
        )}
        placeholder={
          props.placeholder ??
          (datetime ? messages.dateTimePicker.placeholder : messages.datePicker.placeholder)
        }
        displayValue={displayed ? label(displayed) : ''}
        formValue={selected ? canonical(selected) : ''}
        open={open}
        onOpenChange={setOpen}
        commitOnBlur={!needConfirm}
        onOpening={() => {
          touched.current = false;
          setDraft(selected);
          setPanelDraft(null);
          setValidText(true);
        }}
        onClear={() => {
          change(null);
          setDraft(null);
          setPanelDraft(null);
        }}
        onDismiss={() => {
          if (!needConfirm && touched.current && validText && draft && inBounds(draft))
            change(draft);
        }}
        onPanelConfirm={() => {
          if (!draft || !validText || !inBounds(draft)) return false;
          change(draft);
          return true;
        }}
        onTextChange={(text) => {
          const next = parse(text);
          setValidText(Boolean(next && inBounds(next)));
          if (next) setDraft(normalize(next));
        }}
        onTextCommit={(text) => {
          if (!text) {
            change(null);
            return true;
          }
          const next = parse(text);
          if (!next || !inBounds(next)) return false;
          change(next);
          return true;
        }}
        panelClassName={datetime ? 'leaf-datetime-panel' : 'leaf-date-picker__panel'}
        renderPanel={(close) => (
          <>
            <div className={datetime ? 'leaf-picker-view leaf-datetime-panel__body' : undefined}>
              <CalendarPanel
                visibleDate={panelValue}
                onVisibleChange={onPanelChange}
                cellRender={cellRender}
                picker={picker}
                disabledDate={disabledDate}
                value={draft}
                minDate={minDate}
                maxDate={maxDate}
                onChange={(date) => {
                  const next = new Date(date);
                  if (datetime) {
                    next.setHours(
                      base.getHours(),
                      base.getMinutes(),
                      showSeconds ? base.getSeconds() : 0,
                      0,
                    );
                    if (minDate && next < minDate) next.setTime(minDate.getTime());
                    if (maxDate && next > maxDate) next.setTime(maxDate.getTime());
                  }
                  update(next);
                  if (!datetime && !needConfirm) {
                    change(next);
                    close();
                  }
                }}
              />
              {datetime && (
                <div className="leaf-datetime-panel__time">
                  <TimePanel
                    value={timeParts(base)}
                    showSeconds={showSeconds}
                    use12Hours={use12Hours}
                    minuteStep={minuteStep}
                    secondStep={secondStep}
                    disabledTime={(parts) => {
                      const next = new Date(base);
                      next.setHours(parts.hour, parts.minute, parts.second, 0);
                      return !inBounds(next);
                    }}
                    onChange={(parts) => {
                      const next = new Date(base);
                      next.setHours(parts.hour, parts.minute, parts.second, 0);
                      update(next);
                    }}
                  />
                </div>
              )}
            </div>
            {presets?.length ? (
              <div className="leaf-picker-presets">
                {presets.map((preset) => (
                  <ButtonControl
                    key={preset.key ?? String(preset.label)}
                    size="sm"
                    variant="text"
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
                  </ButtonControl>
                ))}
              </div>
            ) : null}
            {(showToday || renderExtraFooter != null || datetime || needConfirm) && (
              <div className="leaf-picker-footer">
                <div className="leaf-picker-footer__extra">
                  {showToday && (
                    <ButtonControl
                      size="sm"
                      variant="outline"
                      disabled={!inBounds(today)}
                      onClick={() => {
                        if (datetime || needConfirm) update(today);
                        else {
                          change(today);
                          close();
                        }
                      }}
                    >
                      {todayText ?? messages.calendar.today}
                    </ButtonControl>
                  )}
                  {renderExtraFooter}
                </div>
                {(datetime || needConfirm) && (
                  <ButtonControl
                    size="sm"
                    variant="solid"
                    disabled={!draft || !validText || !inBounds(draft)}
                    onClick={() => confirm(close)}
                  >
                    {messages.common.confirm}
                  </ButtonControl>
                )}
              </div>
            )}
          </>
        )}
      />
    );
  },
);
export type DatePickerProps = SingleDatePickerProps | TimePickerModeProps;
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(rawProps, ref) {
    const props = useComponentProps('DatePicker', rawProps);
    if (props.picker === 'time') return <TimeInput {...props} ref={ref} />;
    return <SingleDatePicker {...props} ref={ref} />;
  },
);
DatePicker.displayName = 'DatePicker';
