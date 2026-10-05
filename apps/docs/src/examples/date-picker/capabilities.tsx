import { DatePicker, Space } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Custom display and weekday restrictions' : '自定义显示格式与工作日限制'}
        </p>
        <DatePicker
          format="DD/MM/YYYY"
          disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
          presets={[{ label: english ? 'Today' : '今天', value: () => new Date() }]}
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Select up to three dates' : '选择最多三个日期'}
        </p>
        <DatePicker multiple maxCount={3} format="MM/DD" />
      </div>
    </Space>
  );
}
