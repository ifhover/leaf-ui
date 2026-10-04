import { Rate } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <div className="leaf-demo-stack">
      <Rate aria-label="项目评分" value={value} onChange={setValue} allowHalf />
      <output className="leaf-demo-note">当前评分: {value}</output>
    </div>
  );
}
