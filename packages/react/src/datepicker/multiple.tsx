import { forwardRef, useRef } from 'react';
import { useFormField } from '../form/form';
import { CalendarPanel, periodKey, startOfPeriod, withinPeriod } from '../shared/calendar';
import { formatPickerDate, parsePickerDate } from '../shared/date-format';
import { DateInput } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { parseDateText } from '../shared/parse-date';
import type { SingleDatePickerProps } from './datepicker';
export interface MultipleDatePickerProps
  extends Omit<
    SingleDatePickerProps,
    'multiple' | 'value' | 'defaultValue' | 'onChange' | 'presets'
  > {
  multiple: true;
  value?: readonly Date[];
  defaultValue?: readonly Date[];
  maxCount?: number;
  onChange?: (value: Date[], dateStrings: string[]) => void;
}
const emptyDates: readonly Date[] = [];
export const MultipleDatePicker = forwardRef<HTMLInputElement, MultipleDatePickerProps>(
  function MultipleDatePicker(
    {
      value,
      defaultValue = emptyDates,
      onChange,
      multiple: _multiple,
      maxCount = Infinity,
      picker = 'date',
      minDate,
      maxDate,
      disabledDate,
      format,
      parse,
      panelValue,
      onPanelChange,
      cellRender,
      open: controlledOpen,
      defaultOpen,
      onOpenChange,
      showToday: _showToday,
      todayText: _todayText,
      renderExtraFooter,
      ...props
    },
    ref,
  ) {
    const field = useFormField(),
      trigger = useRef<HTMLInputElement>(null),
      merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const [open, setOpen] = usePopupState(
      props.disabled || field?.disabled || props.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const valid = (date: Date) =>
      withinPeriod(date, picker, minDate, maxDate) && !disabledDate?.(date);
    const change = (dates: Date[]) => {
      if (
        props.readOnly ||
        props.disabled ||
        field?.disabled ||
        dates.length > maxCount ||
        !dates.every(valid)
      )
        return;
      setSelected(dates);
      onChange?.(
        dates,
        dates.map((date) => formatPickerDate(date, format, (date) => periodKey(date, picker))),
      );
    };
    return (
      <DateInput
        {...props}
        ref={merged}
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {}}
        displayValue={selected
          .map((date) => formatPickerDate(date, format, (date) => periodKey(date, picker)))
          .join(', ')}
        formValue={selected.map((date) => periodKey(date, picker)).join(',')}
        onClear={() => change([])}
        onTextCommit={(text) => {
          if (!text) {
            change([]);
            return true;
          }
          const dates = text
            .split(/\s*[,，]\s*/)
            .map((text) =>
              parsePickerDate(text, format, (text) => parseDateText(text, picker), parse),
            );
          if (dates.some((date) => !date || !valid(date)) || dates.length > maxCount) return false;
          change(dates as Date[]);
          return true;
        }}
        renderPanel={() => (
          <>
            <CalendarPanel
              picker={picker}
              value={selected.at(-1)}
              values={selected}
              minDate={minDate}
              maxDate={maxDate}
              disabledDate={disabledDate}
              visibleDate={panelValue}
              onVisibleChange={onPanelChange}
              cellRender={cellRender}
              onChange={(date) => {
                const normalized = startOfPeriod(date, picker),
                  key = periodKey(normalized, picker);
                change(
                  selected.some((date) => periodKey(date, picker) === key)
                    ? selected.filter((date) => periodKey(date, picker) !== key)
                    : [...selected, normalized],
                );
              }}
            />
            {renderExtraFooter}
          </>
        )}
      />
    );
  },
);
