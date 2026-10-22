import type { SelectOption } from '@ifhover/leaf-ui';
import { Button, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

const roles = (english: boolean): SelectOption[] => [
  { value: 'design', label: english ? 'Design' : '设计' },
  { value: 'engineering', label: english ? 'Engineering' : '工程' },
  { value: 'marketing', label: english ? 'Marketing' : '市场' },
  { value: 'operations', label: english ? 'Operations' : '运营' },
];

export function PopupAction({ english = false }) {
  const [open, setOpen] = useState(false);
  return (
    <Select
      aria-label={english ? 'Role' : '角色'}
      onOpenChange={setOpen}
      open={open}
      options={roles(english)}
      placeholder={english ? 'Select a role' : '选择角色'}
      popupRender={(content) => (
        <>
          {content}
          <Button onClick={() => setOpen(false)} size="sm" >
            {english ? 'Done' : '完成'}
          </Button>
        </>
      )}
    />
  );
}
