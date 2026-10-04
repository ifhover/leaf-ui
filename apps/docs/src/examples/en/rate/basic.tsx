import { Rate } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <div className="leaf-demo-stack">
      <Rate aria-label="Project rating" value={value} onChange={setValue} allowHalf />
      <output className="leaf-demo-note">Current rating: {value}</output>
    </div>
  );
}
