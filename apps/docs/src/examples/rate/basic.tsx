import { Rate } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <div className="leaf-demo-stack">
      <Rate aria-label="项目评分" value={value} onChange={setValue} allowHalf />
      <p className="leaf-demo-note">当前评分：{value}</p>
      <Rate aria-label="只读评分" defaultValue={4} readOnly color="#20834a" />
      <Rate aria-label="禁用评分" defaultValue={2} disabled size="sm" />
    </div>
  );
}
