import { type DateRange, DateRangePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function DateRangePickerBasic() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <div className="leaf-demo-stack">
      <DateRangePicker aria-label="Date range" value={range} onChange={setRange} />
      {range && (
        <output className="leaf-demo-note">
          {range[0].toLocaleDateString()} – {range[1].toLocaleDateString()}
        </output>
      )}
    </div>
  );
}
