import { DateRangePicker, Space, Text } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Text>{english ? 'Business hours for both endpoints' : '开始与结束均限制在营业时间'}</Text>
      <DateRangePicker
        picker="time"
        defaultValue={['09:00', '17:30']}
        minTime="09:00"
        maxTime="18:00"
        use12Hours
        minuteStep={15}
      />
    </Space>
  );
}
