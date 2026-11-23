import { Button, Space } from '@ifhover/leaf-ui';
import { ArrowRight, Plus } from 'lucide-react';

export function IconButtons() {
  return (
    <Space wrap>
      <Button>
        <Plus />
        新建项目
      </Button>
      <Button>
        继续
        <ArrowRight />
      </Button>
      <Button size="icon" aria-label="添加项目">
        <Plus />
      </Button>
    </Space>
  );
}
