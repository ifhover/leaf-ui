import { DatePicker, Flex, Text } from '@ifhover/leaf-ui';

const labels = { year: 'Year', quarter: 'Quarter', month: 'Month', week: 'Week' } as const;

export function ExtensionDemo() {
  return (
    <Flex direction="column" gap="md">
      {(['year', 'quarter', 'month', 'week'] as const).map((picker) => (
        <Flex key={picker} direction="column" gap="sm" align="start">
          <Text tone="muted">{labels[picker]}</Text>
          <DatePicker aria-label={labels[picker]} picker={picker} />
        </Flex>
      ))}
    </Flex>
  );
}
