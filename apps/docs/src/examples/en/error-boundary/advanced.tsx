function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <span>The fallback replaces only the failed section.</span>;
}

import { Alert, Button, ErrorBoundary } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ErrorBoundaryCustom() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="leaf-demo-stack">
      <Button variant="outline" onClick={() => setBroken(true)}>
        Test fallback
      </Button>
      <ErrorBoundary
        fallback={({ reset }) => (
          <Alert
            title="This section is unavailable"
            description={
              <Button size="sm" variant="ghost" onClick={reset}>
                Try again
              </Button>
            }
          />
        )}
        onReset={() => setBroken(false)}
        resetKeys={[broken]}
      >
        <Content broken={broken} />
      </ErrorBoundary>
    </div>
  );
}
