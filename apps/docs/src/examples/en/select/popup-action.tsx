import { Button, Flex, Select } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function PopupAction() {
  const [open, setOpen] = useState(false);
  return (
    <Flex direction="column" gap="sm">
      <Select
        aria-label="Choose teams and finish"
        multiple
        defaultValue={['design']}
        open={open}
        onOpenChange={setOpen}
        options={options}
        placeholder="Select teams"
        popupRender={(content) => (
          <>
            {content}
            <Flex justify="end">
              <Button onClick={() => setOpen(false)} size="sm">
                Done
              </Button>
            </Flex>
          </>
        )}
      />
      <Flex>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open options
        </Button>
      </Flex>
    </Flex>
  );
}
