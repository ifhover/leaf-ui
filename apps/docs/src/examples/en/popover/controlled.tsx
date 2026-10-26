import { Button, Flex, Form, FormField, Input, Popover, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PopoverControlled() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Leaf Garden');
  const [draft, setDraft] = useState(name);
  return (
    <Flex direction="column" gap="md" align="start">
      <Popover
        title="Edit project"
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
            <FormField label="Project name">
              <Input
                name="projectName"
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
                required
              />
            </FormField>
            <Button type="submit" disabled={!draft.trim()}>
              Save and close
            </Button>
          </Form>
        }
      >
        <Button variant="outline">Edit project</Button>
      </Popover>
      <Text role="status" tone="muted">
        Project name: {name}
      </Text>
    </Flex>
  );
}
