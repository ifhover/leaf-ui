import { Button, Popconfirm } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function PopconfirmBasic() {
  const [removed, setRemoved] = useState(false);
  return (
    <Popconfirm
      title="移除此项目？"
      description="移除后仍可在回收站中恢复。"
      onConfirm={() => setRemoved(true)}
    >
      <Button variant="outline" danger disabled={removed}>
        {removed ? '已移除' : '移除项目'}
      </Button>
    </Popconfirm>
  );
}
