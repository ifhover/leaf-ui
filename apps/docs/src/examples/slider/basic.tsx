import { Slider, type SliderMark } from '@sudden3/leaf-ui';
import { useState } from 'react';

const marks: SliderMark[] = [
  { value: 0, label: '低' },
  { value: 50, label: '中' },
  { value: 100, label: '高' },
];
export function SliderBasic() {
  const [value, setValue] = useState(35);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">音量</span>
        <Slider aria-label="音量" value={value} onChange={setValue} marks={marks} />
      </div>
      <p className="leaf-demo-note">当前数值：{value}</p>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">预算</span>
        <Slider aria-label="预算" range defaultValue={[20, 70]} marks={marks} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用数值</span>
        <Slider aria-label="禁用数值" defaultValue={45} disabled />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">垂直数值</span>
        <Slider aria-label="垂直数值" vertical defaultValue={60} />
      </div>
    </div>
  );
}
