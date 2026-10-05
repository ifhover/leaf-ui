import { forwardRef, type ReactNode, useRef } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { CalendarPanel, periodKey, startOfPeriod, withinPeriod } from '../shared/calendar';
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
import { MultipleDatePicker, type MultipleDatePickerProps } from './multiple';

export interface SingleDatePickerProps extends PickerFieldProps {
  multiple?: false;
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
  format?: DateFormat;
  parse?: (text: string) => Date | null;
  presets?: readonly DatePreset[];
  panelValue?: Date;
  onPanelChange?: (date: Date) => void;
  cellRender?: (date: Date) => ReactNode;
}
const SingleDatePicker = forwardRef<HTMLInputElement, SingleDatePickerProps>(
  function SingleDatePicker(
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
      open: controlledOpen,
      defaultOpen,
      format,
      parse,
      presets,
      panelValue,
      onPanelChange,
      cellRender,
      multiple: _multiple,
      ...props
    },
    ref,
  ) {
    const { messages } = useLeafConfig();
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
    const change = (next: Date | null) => {
      if (props.readOnly || props.disabled || field?.disabled) return;
      const normalized = next ? startOfPeriod(next, picker) : null;
      setSelected(normalized);
      onChange?.(
        normalized,
        normalized ? formatPickerDate(normalized, format, (date) => periodKey(date, picker)) : '',
      );
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      <DateInput
        {...props}
        ref={merged}
        displayValue={
          selected ? formatPickerDate(selected, format, (date) => periodKey(date, picker)) : ''
        }
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
          const parsed = parsePickerDate(
            text,
            format,
            (text) => parseDateText(text, picker),
            parse,
          );
          if (!parsed || !withinPeriod(parsed, picker, minDate, maxDate) || disabledDate?.(parsed))
            return false;
          change(parsed);
          return true;
        }}
        panelClassName="leaf-date-picker__panel"
        renderPanel={(close) => (
          <>
            <CalendarPanel
              visibleDate={panelValue}
              onVisibleChange={onPanelChange}
              cellRender={cellRender}
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
                      if (withinPeriod(date, picker, minDate, maxDate) && !disabledDate?.(date)) {
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
  },
);
export type DatePickerProps = SingleDatePickerProps | MultipleDatePickerProps;
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(props, ref) {
    return props.multiple ? (
      <MultipleDatePicker {...props} ref={ref} />
    ) : (
      <SingleDatePicker {...props} ref={ref} />
    );
  },
);
DatePicker.displayName = 'DatePicker';
