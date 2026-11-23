import { DateRangePicker, Flex, Text } from '@ifhover/leaf-ui';

const labels = {
  year: 'Year range',
  quarter: 'Quarter range',
  month: 'Month range',
  week: 'Week range',
} as const;

export function DateRangePickerModes() {
  return (
    <Flex direction="column" gap="md">
      {(['year', 'quarter', 'month', 'week'] as const).map((picker) => (
        <Flex key={picker} direction="column" gap="sm" align="start">
          <Text tone="muted">{labels[picker]}</Text>
          <DateRangePicker aria-label={labels[picker]} picker={picker} />
        </Flex>
      ))}
    </Flex>
  );
}
