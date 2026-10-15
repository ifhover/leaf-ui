import { type DateRange, DateRangePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function DateRangePickerBasic() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <Form layout="vertical">
      <FormField label="Date range">
        <DateRangePicker aria-label="Date range" value={range} onChange={setRange} />
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
