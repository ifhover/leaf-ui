import { Button, Space } from '@ifhover/leaf-ui';
import { ArrowRight, Plus } from 'lucide-react';

export function IconButtons() {
  return (
    <Space wrap>
      <Button startIcon={<Plus />}>新建项目</Button>
      <Button endIcon={<ArrowRight />}>继续</Button>
      <Button aria-label="添加项目" startIcon={<Plus />} />
    </Space>
  );
}
