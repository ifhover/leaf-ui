import { Segmented } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function SegmentedBasic() {
  const [value, setValue] = useState('Weekly');
  return (
    <div className="leaf-demo-stack">
      <Segmented options={['Daily', 'Weekly', 'Monthly']} value={value} onChange={setValue} />
      <output className="leaf-demo-note">Current view: {value}</output>
    </div>
  );
}
