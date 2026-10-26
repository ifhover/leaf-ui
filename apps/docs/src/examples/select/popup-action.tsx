import { Button, Flex, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function PopupAction() {
  const [open, setOpen] = useState(false);
  return (
    <Flex direction="column" gap="sm">
      <Select
        aria-label="选择团队并完成"
        multiple
        defaultValue={['design']}
        open={open}
        onOpenChange={setOpen}
        options={options}
        placeholder="选择团队"
        popupRender={(content) => (
          <>
            {content}
            <Flex justify="end">
              <Button onClick={() => setOpen(false)} size="sm">
                完成
              </Button>
            </Flex>
          </>
        )}
      />
      <Flex>
        <Button variant="outline" onClick={() => setOpen(true)}>
          打开选项
        </Button>
      </Flex>
    </Flex>
  );
}
