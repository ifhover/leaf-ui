import { Button, Loading } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function LoadingOverlay() {
  const [spinning, setSpinning] = useState(true);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Button variant="outline" onClick={() => setSpinning(!spinning)}>
        {spinning ? 'Finish loading' : 'Start loading'}
      </Button>
      <Loading spinning={spinning} tip="Loading projects" delay={200}>
        <div className="leaf-demo-surface">
          <strong>Leaf Garden</strong>
          <p>See project details and recent updates here.</p>
          <Button variant="outline">Edit project</Button>
        </div>
      </Loading>
    </div>
  );
}
