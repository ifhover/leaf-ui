import { TimeRangePicker } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px' }}>
        {english ? 'Business hours for both endpoints' : '开始与结束均限制在营业时间'}
      </p>
      <TimeRangePicker
        defaultValue={['09:00', '17:30']}
        disabledTime={(time) => time.hour < 9 || time.hour > 18}
        use12Hours
        minuteStep={15}
      />
    </div>
  );
}
