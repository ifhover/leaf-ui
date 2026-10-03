import { type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { CalendarPanel } from '../shared/calendar';
import { classes } from '../shared/classes';

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  visibleDate?: Date;
  onVisibleChange?: (date: Date) => void;
  mode?: 'date' | 'month';
  fullscreen?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date) => ReactNode;
}
export function Calendar({
  value,
  defaultValue,
  onChange,
  visibleDate,
  onVisibleChange,
  mode = 'date',
  fullscreen = true,
  minDate,
  maxDate,
  disabledDate,
  cellRender,
  className,
  'aria-label': label,
  ...props
}: CalendarProps) {
  const { messages } = useLeafConfig();
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const [visible, setVisible] = useState(
    visibleDate ?? defaultValue ?? value ?? minDate ?? new Date(),
  );
  const changeVisible = (next: Date) => {
    if (visibleDate === undefined) setVisible(next);
    onVisibleChange?.(next);
  };
  const valueTime = value?.getTime();
  useEffect(() => {
    if (valueTime !== undefined && visibleDate === undefined) setVisible(new Date(valueTime));
  }, [valueTime, visibleDate]);
  return (
    <section
      {...props}
      aria-label={label ?? messages.calendar}
      className={classes('leaf-calendar-view', fullscreen && 'leaf-calendar-view--full', className)}
    >
      <CalendarPanel
        picker={mode}
        value={selected}
        visibleDate={visibleDate ?? visible}
        onVisibleChange={changeVisible}
        minDate={minDate}
        maxDate={maxDate}
        disabledDate={disabledDate}
        cellRender={cellRender}
        onChange={(next) => {
          if (value === undefined) setInternal(next);
          changeVisible(next);
          onChange?.(next);
        }}
      />
    </section>
  );
}
