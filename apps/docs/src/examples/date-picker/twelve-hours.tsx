import { DatePicker, Flex, Text } from '@ifhover/leaf-ui';

export function DatePickerTwelveHours() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">12 小时制</Text>
        <DatePicker aria-label="12 小时制" picker="time" use12Hours defaultValue="14:30" />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text tone="muted">精确到秒</Text>
        <DatePicker
          aria-label="精确到秒"
          picker="time"
          use12Hours
          showSeconds
          secondStep={10}
          defaultValue="00:05:30"
        />
      </Flex>
    </Flex>
  );
}
