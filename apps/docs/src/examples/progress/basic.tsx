import { Button, Progress } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ProgressBasic() {
  const [percent, setPercent] = useState(45);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Progress percent={percent} aria-label="上传进度" />
      <div className="leaf-demo-row">
        <Button
          variant="outline"
          disabled={percent === 0}
          onClick={() => setPercent(Math.max(0, percent - 10))}
        >
          减少
        </Button>
        <Button disabled={percent === 100} onClick={() => setPercent(Math.min(100, percent + 10))}>
          增加
        </Button>
      </div>
    </div>
  );
}
