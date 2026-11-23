import { Button, ButtonGroup, Dropdown, Flex } from '@ifhover/leaf-ui';
import { ChevronDown, Trash2 } from 'lucide-react';

const items = [
  { key: 'trash', label: 'Move to trash' },
  { key: 'purge', label: 'Delete permanently', danger: true },
];

export function ButtonDanger() {
  return (
    <Flex align="center" gap={12} wrap>
      <Button variant="danger">Delete project</Button>
      <Button variant="danger">
        <Trash2 />
        Delete
      </Button>
      <ButtonGroup variant="danger">
        <Button>Delete</Button>
        <Dropdown items={items}>
          <Button size="icon" aria-label="More delete actions">
            <ChevronDown />
          </Button>
        </Dropdown>
      </ButtonGroup>
    </Flex>
  );
}
