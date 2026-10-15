import { DatePicker, Flex, Space, Text } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>
          {english ? 'Custom display and weekday restrictions' : '自定义显示格式与工作日限制'}
        </Text>
        <DatePicker
          format="DD/MM/YYYY"
          disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
          presets={[{ label: english ? 'Today' : '今天', value: () => new Date() }]}
        />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Select up to three dates' : '选择最多三个日期'}</Text>
        <DatePicker multiple maxCount={3} format="MM/DD" />
      </Flex>
    </Space>
  );
}
