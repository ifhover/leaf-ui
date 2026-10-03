import { Button } from '@sudden3/leaf-ui';
import '@sudden3/leaf-ui/styles.css';
import { useState } from 'react';

export function GettingStartedExample() {
  const [count, setCount] = useState(0);

  return <Button onClick={() => setCount((value) => value + 1)}>Clicked {count} times</Button>;
}
