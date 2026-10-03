import { Button, Progress } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ProgressBasic() {
  const [percent, setPercent] = useState(45);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Progress percent={percent} aria-label="Upload progress" />
      <Progress percent={70} status="error" />
      <Progress percent={100} />
      <Progress indeterminate aria-label="Loading progress" />
      <div className="leaf-demo-row">
        <Progress percent={percent} type="circle" aria-label="Project progress" />
        <Progress percent={100} type="circle" size={80} />
        <Progress percent={60} type="circle" status="error" size={80} />
      </div>
      <div className="leaf-demo-row">
        <Button
          variant="outline"
          disabled={percent === 0}
          onClick={() => setPercent(Math.max(0, percent - 10))}
        >
          Decrease
        </Button>
        <Button disabled={percent === 100} onClick={() => setPercent(Math.min(100, percent + 10))}>
          Increase
        </Button>
      </div>
    </div>
  );
}
