import { Calendar, Tag } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function CalendarBasic() {
  const [value, setValue] = useState(new Date(2026, 9, 4));
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Calendar
        value={value}
        onChange={setValue}
        cellRender={(date) =>
          date.getMonth() === 9 && date.getDate() === 8 ? (
            <Tag color="primary" size="sm">
              项目评审
            </Tag>
          ) : date.getMonth() === 9 && date.getDate() === 15 ? (
            <Tag color="info" size="sm">
              发布
            </Tag>
          ) : null
        }
      />
      <p className="leaf-demo-note">
        已选日期：{value.getFullYear()}-{value.getMonth() + 1}-{value.getDate()}
      </p>
      <div className="leaf-demo-row">
        <Calendar
          fullscreen={false}
          defaultValue={new Date(2026, 9, 4)}
          disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
        />
        <Calendar fullscreen={false} mode="month" defaultValue={new Date(2026, 9, 1)} />
      </div>
    </div>
  );
}
