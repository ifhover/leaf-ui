import { DatePicker, Flex, Text } from '@ifhover/leaf-ui';

export function DatePickerStates() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">禁用</Text>
        <DatePicker aria-label="禁用" defaultValue={new Date(2026, 9, 15)} disabled />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">只读</Text>
        <DatePicker aria-label="只读" defaultValue={new Date(2026, 9, 15)} readOnly />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">仅面板选择</Text>
        <DatePicker aria-label="仅面板选择" defaultValue={new Date(2026, 9, 15)} inputReadOnly />
      </Flex>
    </Flex>
  );
}
