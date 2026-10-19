function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <span>The fallback replaces only the failed section.</span>;
}

import { Alert, Button, ErrorBoundary, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ErrorBoundaryCustom() {
  const [broken, setBroken] = useState(false);
  return (
    <Space direction="vertical" align="stretch">
      <Button variant="outline" onClick={() => setBroken(true)}>
        Test fallback
      </Button>
      <ErrorBoundary
        fallback={({ reset }) => (
          <Alert
            title="This section is unavailable"
            description={
              <Button size="sm" variant="soft" onClick={reset}>
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
    </Space>
  );
}
