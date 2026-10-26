import { type DateRange, DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

function recentSevenDays(): DateRange {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return [start, end];
}

export function Presets() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="统计区间">
        <DateRangePicker presets={[{ label: '最近七天', value: recentSevenDays }]} />
      </FormField>
    </Form>
  );
}
