import { forwardRef, type ReactNode, useRef } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { CalendarPanel, withinPeriod } from '../shared/calendar';
import { dateKey } from '../shared/date';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { parseDateText } from '../shared/parse-date';

export interface DatePickerProps extends PickerFieldProps {
  value?: Date | null;
  defaultValue?: Date | null;
  minDate?: Date;
  maxDate?: Date;
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
    setSelected(next);
    onChange?.(next, next ? dateKey(next) : '');
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <DateInput
      {...props}
      ref={merged}
      displayValue={selected ? dateKey(selected) : ''}
      formValue={selected ? dateKey(selected) : ''}
      open={open}
      onOpenChange={setOpen}
      onOpening={() => {}}
      onClear={() => change(null)}
      onTextCommit={(text) => {
        if (!text) {
          change(null);
          return true;
        }
        const parsed = parseDateText(text);
        if (!parsed || !withinPeriod(parsed, 'date', minDate, maxDate)) return false;
        change(parsed);
        return true;
      }}
      panelClassName="leaf-date-picker__panel"
      renderPanel={(close) => (
        <>
          <CalendarPanel
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
                    disabled={!withinPeriod(today, 'date', minDate, maxDate)}
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
