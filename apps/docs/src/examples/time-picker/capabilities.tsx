import { Space, TimePicker } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div>
        {english
          ? 'Business hours; disabled choices cannot be submitted'
          : '营业时间；禁用项无法选择或通过输入提交'}
        <TimePicker
          use12Hours
          defaultValue="09:30"
          disabledTime={(time) => time.hour < 9 || time.hour >= 18}
          minuteStep={15}
        />
      </div>
    </Space>
  );
}
