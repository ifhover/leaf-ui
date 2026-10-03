import { Button } from '@sudden3/leaf-ui';
import { Trash2 } from 'lucide-react';

export function ButtonDanger() {
  return (
    <>
      <Button danger startIcon={<Trash2 />}>
        删除项目
      </Button>
      <Button danger variant="soft">
        移除成员
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
    </>
  );
}
