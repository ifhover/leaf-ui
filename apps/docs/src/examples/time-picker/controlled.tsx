import { DatePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TimePickerControlled() {
  const [time, setTime] = useState<string | null>('14:30');
  return (
    <Form layout="vertical">
      <FormField label="会议时间">
        <DatePicker
          picker="time"
          aria-label="会议时间"
          value={time}
          onChange={setTime}
          minuteStep={15}
        />
      </FormField>
      <Text tone="muted">以 15 分钟为间隔，当前值：{time || '未选择'}</Text>
      <FormField label="保留不符合间隔的已有值">
        <DatePicker
          picker="time"
          aria-label="保留时间"
          defaultValue="08:07"
          minuteStep={15}
          allowClear={false}
        />
      </FormField>
    </Form>
  );
}
