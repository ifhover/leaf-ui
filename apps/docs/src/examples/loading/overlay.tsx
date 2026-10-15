import { Button, Card, Loading, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function LoadingOverlay() {
  const [spinning, setSpinning] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Button variant="outline" onClick={() => setSpinning(!spinning)}>
        {spinning ? '结束加载' : '开始加载'}
      </Button>
      <Loading spinning={spinning} tip="正在读取项目" delay={200}>
        <Card>
          <strong>Leaf Garden</strong>
          <p>在此查看项目概览和最近更新。</p>
          <Button variant="outline">编辑项目</Button>
        </Card>
      </Loading>
    </Space>
  );
}
