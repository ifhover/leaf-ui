import { Button, DatePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function DatePickerFooter() {
  const [value, setValue] = useState<Date | null>(null);
  const tomorrow = () => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    setValue(next);
  };
  return (
    <div className="leaf-demo-case">
      <span className="leaf-demo-label">Custom date shortcuts</span>
      <DatePicker
        aria-label="Custom date shortcuts"
        value={value}
        onChange={setValue}
        todayText="Today"
        renderExtraFooter={
          <Button variant="ghost" size="sm" onClick={tomorrow}>
            Tomorrow
          </Button>
        }
      />
    </div>
  );
}
