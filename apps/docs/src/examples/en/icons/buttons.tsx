import { Button, Space } from '@ifhover/leaf-ui';
import { ArrowRight, Plus } from 'lucide-react';

export function IconButtons() {
  return (
    <Space wrap>
      <Button>
        <Plus />
        New project
      </Button>
      <Button>
        Continue
        <ArrowRight />
      </Button>
      <Button size="icon" aria-label="Add project">
        <Plus />
      </Button>
    </Space>
  );
}
