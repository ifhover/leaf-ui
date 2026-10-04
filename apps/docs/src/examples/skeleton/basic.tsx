import { Button, Skeleton } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SkeletonBasic() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Button variant="outline" onClick={() => setLoading(!loading)}>
        切换加载状态
      </Button>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">内容加载</span>
        <Skeleton loading={loading} avatar rows={3} rowWidths={['100%', '85%', '55%']} round>
          <p>项目内容已加载完成。</p>
        </Skeleton>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">静态占位</span>
        <Skeleton active={false} title={false} rows={2} />
      </div>
    </div>
  );
}
