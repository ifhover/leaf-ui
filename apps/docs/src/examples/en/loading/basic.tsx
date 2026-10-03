import { Button, Loading } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function LoadingBasic() {
  const [spinning, setSpinning] = useState(true);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        <Loading size="sm" />
        <Loading tip="Loading" />
        <Loading size="lg" />
      </div>
      <Button variant="outline" onClick={() => setSpinning(!spinning)}>
        {spinning ? 'Stop loading' : 'Start loading'}
      </Button>
      <Loading spinning={spinning} tip="Loading project" delay={200}>
        <div className="leaf-demo-surface">
          <strong>Leaf Garden</strong>
          <p>View the project overview and recent updates.</p>
          <Button variant="outline">Edit project</Button>
        </div>
      </Loading>
    </div>
  );
}
