import { Button, Space } from '@ifhover/leaf-ui';
import { ArrowRight, Plus } from 'lucide-react';

export function IconButtons() {
  return (
    <Space wrap>
      <Button startIcon={<Plus />}>New project</Button>
      <Button endIcon={<ArrowRight />}>Continue</Button>
      <Button aria-label="Add project" startIcon={<Plus />} />
    </Space>
  );
}
