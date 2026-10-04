import { Slider, type SliderMark } from '@sudden3/leaf-ui';
import { useState } from 'react';

const marks: SliderMark[] = [
  { value: 0, label: 'Low' },
  { value: 50, label: 'Mid' },
  { value: 100, label: 'High' },
];
export function SliderBasic() {
  const [value, setValue] = useState(35);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Volume</span>
        <Slider aria-label="Volume" value={value} onChange={setValue} marks={marks} />
      </div>
      <p className="leaf-demo-note">Current value: {value}</p>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Budget</span>
        <Slider aria-label="Budget" range defaultValue={[20, 70]} marks={marks} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled value</span>
        <Slider aria-label="Disabled value" defaultValue={45} disabled />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Vertical value</span>
        <Slider aria-label="Vertical value" vertical defaultValue={60} />
      </div>
    </div>
  );
}
