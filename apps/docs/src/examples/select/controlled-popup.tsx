import type { SelectOption } from '@ifhover/leaf-ui';
import { Button, Flex, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ControlledPopup({ english = false }) {
  const options: SelectOption[] = [
    { value: 'design', label: english ? 'Design' : '设计' },
    { value: 'engineering', label: english ? 'Engineering' : '工程' },
    { value: 'marketing', label: english ? 'Marketing' : '市场' },
    { value: 'operations', label: english ? 'Operations' : '运营' },
  ];
  const [open, setOpen] = useState(false);
  return (
    <Flex align="center" gap="sm" wrap>
      <Select
        aria-label={english ? 'Role' : '角色'}
        onOpenChange={setOpen}
        open={open}
        options={options}
        placeholder={english ? 'Select a role' : '选择角色'}
      />
      <Button onClick={() => setOpen((current) => !current)} variant="outline">
        {open ? (english ? 'Close' : '收起') : english ? 'Open' : '展开'}
      </Button>
    </Flex>
  );
}
