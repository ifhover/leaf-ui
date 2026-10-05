import { DateTimePicker } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px' }}>
        {english ? 'Business hours, custom format and preset' : '营业时间、自定义格式与快捷预设'}
      </p>
      <DateTimePicker
        format="DD/MM/YYYY HH:mm"
        showSeconds={false}
        disabledDate={(date) => date.getDay() === 0}
        disabledTime={(date) => date.hour < 9 || date.hour > 18}
        presets={[
          {
            label: english ? 'Tomorrow at 10' : '明天十点',
            value: () => {
              const date = new Date();
              date.setDate(date.getDate() + 1);
              date.setHours(10, 0, 0, 0);
              return date;
            },
          },
        ]}
      />
    </div>
  );
}
