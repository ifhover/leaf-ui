import { Button, Space } from '@ifhover/leaf-ui';
import { Trash2 } from 'lucide-react';

export function ButtonDanger() {
  return (
    <Space wrap>
      <Button danger startIcon={<Trash2 />}>
        删除项目
      </Button>
      <Button danger variant="outline">
        撤销授权
      </Button>
      <Button danger variant="ghost">
        清空
      </Button>
      <Button danger disabled>
        禁止删除
      </Button>
      <Button danger loading>
        正在删除
      </Button>
    </Space>
  );
}
