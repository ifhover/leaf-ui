import { Button } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function GettingStartedExample() {
  const [count, setCount] = useState(0);

  return <Button onClick={() => setCount((value) => value + 1)}>Clicked {count} times</Button>;
}
