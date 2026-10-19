import { Button, Flex, Select, Space, Tag, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = ['Design', 'Engineering', 'Marketing', 'Operations'].map((label) => ({
  value: label,
  label,
}));
export function Capabilities({ english = false }) {
  const [open, setOpen] = useState(false);
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>
          {english ? 'Responsive tags, constrained to the available width' : '根据宽度自动折叠标签'}
        </Text>
        <Select
          multiple
          showSearch
          defaultValue={['Design', 'Engineering', 'Marketing']}
          options={options}
          maxTagCount="responsive"
          tagRender={(option, remove) => (
            <Tag closable onClose={remove}>
              {option.label}
            </Tag>
          )}
        />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Controlled popup with an extra action' : '受控浮层与附加操作'}</Text>
        <Select
          options={options}
          open={open}
          onOpenChange={setOpen}
          labelRender={(option) => <strong>{option.label}</strong>}
          popupRender={(content) => (
            <>
              {content}
              <Button size="sm" variant="soft" onClick={() => setOpen(false)}>
                {english ? 'Done' : '完成'}
              </Button>
            </>
          )}
        />
      </Flex>
    </Space>
  );
}
