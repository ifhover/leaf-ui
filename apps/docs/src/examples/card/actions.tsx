import { Button, Card, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardActions() {
  const [saved, setSaved] = useState(false);

  return (
    <Card
      title="项目资料"
      description="标题、说明、分隔线与底部操作样式与弹窗保持一致。"
      extra={
        <Button variant="link" disabled={!saved} onClick={() => setSaved(false)}>
          重置
        </Button>
      }
      footer={
        <>
          <Button variant="outline" disabled={!saved} onClick={() => setSaved(false)}>
            撤销
          </Button>
          <Button variant="solid" disabled={saved} onClick={() => setSaved(true)}>
            保存
          </Button>
        </>
      }
    >
      <Text role="status">{saved ? '修改已保存。' : '有尚未保存的修改。'}</Text>
    </Card>
  );
}
