import { Button, Skeleton } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SkeletonBasic() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Button variant="outline" onClick={() => setLoading(!loading)}>
        Toggle loading
      </Button>
      <Skeleton loading={loading} avatar rows={3} rowWidths={['100%', '85%', '55%']} round>
        <p>Project content is ready.</p>
      </Skeleton>
      <Skeleton active={false} title={false} rows={2} />
    </div>
  );
}
