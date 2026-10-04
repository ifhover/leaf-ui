function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <span>备用界面只替换出错的区块。</span>;
}

import { Alert, Button, ErrorBoundary } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ErrorBoundaryCustom() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="leaf-demo-stack">
      <Button variant="outline" onClick={() => setBroken(true)}>
        测试备用界面
      </Button>
      <ErrorBoundary
        fallback={({ reset }) => (
          <Alert
            title="此区块不可用"
            description={
              <Button size="sm" variant="ghost" onClick={reset}>
                再次尝试
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
