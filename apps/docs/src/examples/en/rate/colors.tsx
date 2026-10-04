import { Rate } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function RateColors() {
  const [value, setValue] = useState(2);
  return (
    <div className="leaf-demo-stack">
      <Rate aria-label="Score colors" value={value} onChange={setValue} colorByValue />
      <output className="leaf-demo-note">
        Coral for low scores, amber for medium and yellow for high. Current rating: {value}
      </output>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Brand color</span>
        <Rate defaultValue={4} readOnly color="#7654c6" />
      </div>
    </div>
  );
}
