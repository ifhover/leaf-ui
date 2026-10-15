import { Button } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function GettingStartedExample() {
  const [count, setCount] = useState(0);

  return <Button onClick={() => setCount((value) => value + 1)}>已点击 {count} 次</Button>;
}
