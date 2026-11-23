import { DatePicker, Flex, Text } from '@ifhover/leaf-ui';

export function DatePickerCard() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">Date</Text>
        <DatePicker aria-label="Date" panelVariant="card" defaultValue={new Date(2026, 9, 15)} />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">Time</Text>
        <DatePicker aria-label="Time" picker="time" panelVariant="card" defaultValue="10:30" />
      </Flex>
    </Flex>
  );
}
