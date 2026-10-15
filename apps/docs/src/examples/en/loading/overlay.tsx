import { Button, Card, Loading, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function LoadingOverlay() {
  const [spinning, setSpinning] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Button variant="outline" onClick={() => setSpinning(!spinning)}>
        {spinning ? 'Finish loading' : 'Start loading'}
      </Button>
      <Loading spinning={spinning} tip="Loading projects" delay={200}>
        <Card>
          <strong>Leaf Garden</strong>
          <p>See project details and recent updates here.</p>
          <Button variant="outline">Edit project</Button>
        </Card>
      </Loading>
    </Space>
  );
}
