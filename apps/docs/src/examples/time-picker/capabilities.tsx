import { DatePicker, Flex, Space } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        {english
          ? 'Business hours; disabled choices cannot be submitted'
          : '营业时间；禁用项无法选择或通过输入提交'}
        <DatePicker
          picker="time"
          use12Hours
          defaultValue="09:30"
          disabledTime={(time) => time.hour < 9 || time.hour >= 18}
          minuteStep={15}
        />
      </Flex>
    </Space>
  );
}
