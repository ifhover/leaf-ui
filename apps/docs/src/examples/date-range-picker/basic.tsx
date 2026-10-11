import { type DateRange, DateRangePicker, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function DateRangePickerBasic() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">日期区间</span>
        <DateRangePicker aria-label="日期区间" value={range} onChange={setRange} />
      </div>
      {range && (
        <output className="leaf-demo-note">
          {range[0].toLocaleDateString()} – {range[1].toLocaleDateString()}
        </output>
      )}
    </Space>
  );
}
