import { forwardRef, type ReactNode, useRef } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { CalendarPanel, periodKey, startOfPeriod, withinPeriod } from '../shared/calendar';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { parseDateText } from '../shared/parse-date';

export interface DatePickerProps extends PickerFieldProps {
  value?: Date | null;
  defaultValue?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  picker?: 'date' | 'year' | 'quarter' | 'month' | 'week';
  disabledDate?: (date: Date) => boolean;
  showToday?: boolean;
  todayText?: ReactNode;
  renderExtraFooter?: ReactNode;
  onChange?: (value: Date | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;
}
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue = null,
    minDate,
    maxDate,
    picker = 'date',
    disabledDate,
    showToday = true,
    todayText,
    renderExtraFooter,
    onChange,
    onOpenChange,
    ...props
  },
  ref,
) {
  const { messages } = useLeafConfig();
  const field = useFormField();
  const trigger = useRef<HTMLInputElement>(null);
  const merged = useMergedRef(trigger, ref);
  const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
  const [open, setOpen] = usePopupState(props.disabled ?? field?.disabled, onOpenChange);
  const change = (next: Date | null) => {
    const normalized = next ? startOfPeriod(next, picker) : null;
    setSelected(normalized);
    onChange?.(normalized, normalized ? periodKey(normalized, picker) : '');
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <DateInput
      {...props}
      ref={merged}
      displayValue={selected ? periodKey(selected, picker) : ''}
      formValue={selected ? periodKey(selected, picker) : ''}
      open={open}
      onOpenChange={setOpen}
      onOpening={() => {}}
      onClear={() => change(null)}
      onTextCommit={(text) => {
        if (!text) {
          change(null);
          return true;
        }
        const parsed = parseDateText(text, picker);
        if (!parsed || !withinPeriod(parsed, picker, minDate, maxDate) || disabledDate?.(parsed))
          return false;
        change(parsed);
        return true;
      }}
      panelClassName="leaf-date-picker__panel"
      renderPanel={(close) => (
        <>
          <CalendarPanel
            picker={picker}
            disabledDate={disabledDate}
            value={selected}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(date) => {
              change(date);
              close();
            }}
          />
          {(showToday || renderExtraFooter != null) && (
            <div className="leaf-picker-footer">
              <div className="leaf-picker-footer__extra">
                {showToday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={
                      !withinPeriod(today, picker, minDate, maxDate) ||
                      disabledDate?.(startOfPeriod(today, picker))
                    }
                    onClick={() => {
                      change(today);
                      close();
                    }}
                  >
                    {todayText ?? messages.today}
                  </Button>
                )}
                {renderExtraFooter}
              </div>
            </div>
          )}
        </>
      )}
    />
  );
});
DatePicker.displayName = 'DatePicker';
