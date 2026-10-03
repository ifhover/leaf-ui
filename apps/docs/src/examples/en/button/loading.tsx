import { Button } from '@sudden3/leaf-ui';
import { useEffect, useRef, useState } from 'react';

export function ButtonLoading() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function save() {
    clearTimeout(timer.current);
    setStatus('loading');
    // This example simulates a request; replace it with your application request.
    timer.current = setTimeout(() => setStatus('saved'), 1200);
  }

  return (
    <>
      <Button loading={status === 'loading'} onClick={save}>
        {status === 'loading' ? 'Saving' : status === 'saved' ? 'Save again' : 'Save changes'}
      </Button>
      <span role="status">{status === 'saved' ? 'Changes saved.' : 'Try saving changes.'}</span>
    </>
  );
}
