import { type DateRange, DateRangePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function DateRangePickerBasic() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <Form layout="vertical">
      <FormField label="日期区间">
        <DateRangePicker aria-label="日期区间" value={range} onChange={setRange} />
      </FormField>
      {range && (
        <output>
          <Text tone="muted">
            {range[0].toLocaleDateString()} – {range[1].toLocaleDateString()}
          </Text>
        </output>
      )}
    </Form>
  );
}
