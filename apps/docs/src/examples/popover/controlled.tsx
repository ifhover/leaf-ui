import { Button, Flex, Form, FormField, Input, Popover, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PopoverControlled() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Leaf Garden');
  const [draft, setDraft] = useState(name);
  return (
    <Flex direction="column" gap="md" align="start">
      <Popover
        title="编辑项目"
        width={280}
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(name);
          setOpen(next);
        }}
        content={
          <Form
            layout="vertical"
            onSubmit={(event) => {
              event.preventDefault();
              setName(draft.trim());
              setOpen(false);
            }}
          >
            <FormField label="项目名称">
              <Input
                name="projectName"
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
                required
              />
            </FormField>
            <Button type="submit" disabled={!draft.trim()}>
              保存并关闭
            </Button>
          </Form>
        }
      >
        <Button variant="outline">编辑项目</Button>
      </Popover>
      <Text role="status" tone="muted">
        项目名称: {name}
      </Text>
    </Flex>
  );
}
