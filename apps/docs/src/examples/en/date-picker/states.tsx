import { DatePicker, Flex, Text } from '@ifhover/leaf-ui';

export function DatePickerStates() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">Disabled</Text>
        <DatePicker aria-label="Disabled" defaultValue={new Date(2026, 9, 15)} disabled />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">Read-only</Text>
        <DatePicker aria-label="Read-only" defaultValue={new Date(2026, 9, 15)} readOnly />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">Panel selection only</Text>
        <DatePicker
          aria-label="Panel selection only"
          defaultValue={new Date(2026, 9, 15)}
          inputReadOnly
        />
      </Flex>
    </Flex>
  );
}
