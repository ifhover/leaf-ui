import { DatePicker, Flex, Text } from '@ifhover/leaf-ui';

export function DatePickerCard() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">日期</Text>
        <DatePicker aria-label="日期" panelVariant="card" defaultValue={new Date(2026, 9, 15)} />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">时间</Text>
        <DatePicker aria-label="时间" picker="time" panelVariant="card" defaultValue="10:30" />
      </Flex>
    </Flex>
  );
}
