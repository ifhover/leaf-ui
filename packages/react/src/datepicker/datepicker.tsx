import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, useEffect, useId, useRef, useState } from 'react';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import {
  calendarDays,
  dateKey,
  formatDateLabel,
  formatMonthLabel,
  isAfterDay,
  isBeforeDay,
  monthKey,
  sameDate,
  shiftMonth,
} from '../shared/date';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss, usePopupState } from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface DatePickerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  value?: Date | null;
  defaultValue?: Date | null;
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  form?: string;
  onChange?: (date: Date | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue = null,
    size = 'md',
    status,
    placeholder = '请选择日期',
    minDate,
    maxDate,
    name,
    required,
    allowClear = true,
    form,
    className,
    style,
    disabled,
    id,
    onChange,
    onOpenChange,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const panelId = `${generatedId}-calendar`;
  const initialDate = value ?? defaultValue;
  const [selectedDate, setSelectedDate] = useFieldValue(value, defaultValue, triggerRef, form);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date((initialDate ?? new Date()).getFullYear(), (initialDate ?? new Date()).getMonth(), 1),
  );
  const [open, setOpen] = usePopupState(disabled, onOpenChange);
  const [activeDate, setActiveDate] = useState(initialDate ?? new Date());
  const focusDate = useRef(false);

  useEffect(() => {
    if (open && focusDate.current) {
      panelRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day='${dateKey(activeDate)}']`)
        ?.focus();
      focusDate.current = false;
    }
  }, [open, activeDate]);

  const setTriggerRef = useMergedRef(triggerRef, forwardedRef);

  const close = () => {
    setOpen(false);
  };

  useFloatingDismiss(open, close, triggerRef, panelRef);

  const openCalendar = () => {
    if (disabled) {
      return;
    }
    let next = selectedDate ?? new Date();
    if (minDate && isBeforeDay(next, minDate)) next = minDate;
    if (maxDate && isAfterDay(next, maxDate)) next = maxDate;
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setActiveDate(next);
    focusDate.current = true;
    setOpen(true);
  };

  const selectDate = (date: Date) => {
    if ((minDate && isBeforeDay(date, minDate)) || (maxDate && isAfterDay(date, maxDate))) {
      return;
    }
    const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(nextDate);
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    onChange?.(nextDate, dateKey(nextDate));
    close();
    triggerRef.current?.focus();
  };

  const days = calendarDays(visibleMonth);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  const moveDate = (date: Date, key: string) => {
    const next = new Date(date);
    const weekday = (date.getDay() + 6) % 7;
    if (key === 'ArrowLeft') next.setDate(date.getDate() - 1);
    else if (key === 'ArrowRight') next.setDate(date.getDate() + 1);
    else if (key === 'ArrowUp') next.setDate(date.getDate() - 7);
    else if (key === 'ArrowDown') next.setDate(date.getDate() + 7);
    else if (key === 'Home') next.setDate(date.getDate() - weekday);
    else if (key === 'End') next.setDate(date.getDate() + 6 - weekday);
    else if (key === 'PageUp' || key === 'PageDown') {
      const month = shiftMonth(date, key === 'PageUp' ? -1 : 1);
      next.setTime(
        new Date(
          month.getFullYear(),
          month.getMonth(),
          Math.min(
            date.getDate(),
            new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
          ),
        ).getTime(),
      );
    }
    if (minDate && isBeforeDay(next, minDate)) next.setTime(minDate.getTime());
    if (maxDate && isAfterDay(next, maxDate)) next.setTime(maxDate.getTime());
    setActiveDate(next);
    focusDate.current = true;
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const changeMonth = (direction: number) => {
    const month = shiftMonth(visibleMonth, direction);
    let next = new Date(
      month.getFullYear(),
      month.getMonth(),
      Math.min(
        activeDate.getDate(),
        new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
      ),
    );
    if (minDate && isBeforeDay(next, minDate)) next = minDate;
    if (maxDate && isAfterDay(next, maxDate)) next = maxDate;
    setActiveDate(next);
    setVisibleMonth(month);
  };

  return (
    <div
      className={classes('leaf-date-picker', `leaf-date-picker--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && selectedDate && !disabled ? '' : undefined}
    >
      <button
        {...props}
        ref={setTriggerRef}
        id={id}
        form={form}
        type="button"
        className="leaf-date-picker__trigger"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={status === 'error' ? true : ariaInvalid}
        aria-required={required || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (open) close();
            else openCalendar();
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!open) openCalendar();
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      >
        <CalendarDays size={16} aria-hidden="true" />
        <span className={classes(!selectedDate && 'leaf-date-picker__placeholder')}>
          {selectedDate ? formatDateLabel(selectedDate) : placeholder}
        </span>
      </button>
      {allowClear && selectedDate && !disabled && (
        <ClearButton
          label="清除日期"
          onClear={() => {
            setSelectedDate(null);
            onChange?.(null, '');
            close();
            triggerRef.current?.focus();
          }}
        />
      )}
      <FormValue
        name={name}
        form={form}
        value={selectedDate ? dateKey(selectedDate) : ''}
        disabled={disabled}
        required={required}
        triggerRef={triggerRef}
      />
      {open && (
        <FloatingPanel
          triggerRef={triggerRef}
          panelRef={panelRef}
          id={panelId}
          className="leaf-floating leaf-date-picker__panel"
          role="dialog"
          aria-label="选择日期"
        >
          <div className="leaf-date-picker__header">
            <button
              type="button"
              className="leaf-date-picker__nav"
              aria-label="上个月"
              disabled={Boolean(
                minDate &&
                  isBeforeDay(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 0),
                    minDate,
                  ),
              )}
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <strong aria-live="polite">{formatMonthLabel(visibleMonth)}</strong>
            <button
              type="button"
              className="leaf-date-picker__nav"
              aria-label="下个月"
              disabled={Boolean(maxDate && isAfterDay(shiftMonth(visibleMonth, 1), maxDate))}
              onClick={() => changeMonth(1)}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
          <table
            className="leaf-date-picker__grid"
            // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: APG date-picker calendar uses a table with grid semantics and roving focus.
            role="grid"
            aria-label={formatMonthLabel(visibleMonth)}
          >
            <thead>
              <tr>
                {weekdays.map((weekday) => (
                  <th key={weekday} scope="col">
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week[0] ? dateKey(week[0]) : ''}>
                  {week.map((date) => {
                    const disabledDate = Boolean(
                      (minDate && isBeforeDay(date, minDate)) ||
                        (maxDate && isAfterDay(date, maxDate)),
                    );
                    const outsideMonth = monthKey(date) !== monthKey(visibleMonth);
                    const selected = sameDate(date, selectedDate);
                    const today = sameDate(date, new Date());
                    return (
                      // biome-ignore lint/a11y/useFocusableInteractive lint/a11y/noNoninteractiveElementToInteractiveRole: APG calendar gridcells contain a day button that owns the roving keyboard focus.
                      <td key={dateKey(date)} role="gridcell" aria-selected={selected}>
                        <button
                          type="button"
                          data-day={dateKey(date)}
                          tabIndex={sameDate(date, activeDate) ? 0 : -1}
                          aria-label={dateKey(date)}
                          className={classes(
                            'leaf-date-picker__day',
                            outsideMonth && 'leaf-date-picker__day--outside',
                            selected && 'leaf-date-picker__day--selected',
                          )}
                          aria-current={today ? 'date' : undefined}
                          disabled={disabledDate}
                          onClick={() => selectDate(date)}
                          onKeyDown={(event) => {
                            if (
                              [
                                'ArrowLeft',
                                'ArrowRight',
                                'ArrowUp',
                                'ArrowDown',
                                'Home',
                                'End',
                                'PageUp',
                                'PageDown',
                              ].includes(event.key)
                            ) {
                              event.preventDefault();
                              moveDate(date, event.key);
                            }
                          }}
                        >
                          {date.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </FloatingPanel>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
