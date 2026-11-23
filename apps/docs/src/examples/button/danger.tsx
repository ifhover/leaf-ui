import { Button, ButtonGroup, Dropdown, Flex } from '@ifhover/leaf-ui';
import { ChevronDown, Trash2 } from 'lucide-react';

const items = [
  { key: 'trash', label: '移至回收站' },
  { key: 'purge', label: '彻底删除', danger: true },
];

export function ButtonDanger() {
  return (
    <Flex align="center" gap={12} wrap>
      <Button variant="danger">删除项目</Button>
      <Button variant="danger">
        <Trash2 />
        删除
      </Button>
      <ButtonGroup variant="danger">
        <Button>删除</Button>
        <Dropdown items={items}>
          <Button size="icon" aria-label="更多删除操作">
            <ChevronDown />
          </Button>
        </Dropdown>
      </ButtonGroup>
    </Flex>
  );
}
