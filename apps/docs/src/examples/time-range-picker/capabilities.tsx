import { Space, Text, TimeRangePicker } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Text>{english ? 'Business hours for both endpoints' : '开始与结束均限制在营业时间'}</Text>
      <TimeRangePicker
        defaultValue={['09:00', '17:30']}
        disabledTime={(time) => time.hour < 9 || time.hour > 18}
        use12Hours
        minuteStep={15}
      />
    </Space>
  );
}
