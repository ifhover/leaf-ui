import { Rate } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <div className="leaf-demo-stack">
      <Rate aria-label="Project rating" value={value} onChange={setValue} allowHalf />
      <p className="leaf-demo-note">Current rating: {value}</p>
      <Rate aria-label="Read only rating" defaultValue={4} readOnly color="#20834a" />
      <Rate aria-label="Disabled rating" defaultValue={2} disabled size="sm" />
    </div>
  );
}
