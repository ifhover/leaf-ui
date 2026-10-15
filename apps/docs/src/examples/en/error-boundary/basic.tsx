function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <p>Content is displayed normally.</p>;
}

import { Button, ErrorBoundary, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ErrorBoundaryBasic() {
  const [broken, setBroken] = useState(false);
  return (
    <Space direction="vertical" align="stretch">
      <Button variant="outline" onClick={() => setBroken(true)}>
        Simulate a rendering error
      </Button>
      <ErrorBoundary onReset={() => setBroken(false)}>
        <Content broken={broken} />
      </ErrorBoundary>
    </Space>
  );
}
