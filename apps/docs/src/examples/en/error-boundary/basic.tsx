function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <p>Content is displayed normally.</p>;
}

import { Button, ErrorBoundary } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ErrorBoundaryBasic() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="leaf-demo-stack">
      <Button variant="outline" onClick={() => setBroken(true)}>
        Simulate a rendering error
      </Button>
      <ErrorBoundary onReset={() => setBroken(false)}>
        <Content broken={broken} />
      </ErrorBoundary>
    </div>
  );
}
