import { Button, Select, Space, Tag } from '@sudden3/leaf-ui';
import { useState } from 'react';

const options = ['Design', 'Engineering', 'Marketing', 'Operations'].map((label) => ({
  value: label,
  label,
}));
export function Capabilities({ english = false }) {
  const [open, setOpen] = useState(false);
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Responsive tags, constrained to the available width' : '根据宽度自动折叠标签'}
        </p>
        <Select
          multiple
          showSearch
          defaultValue={['Design', 'Engineering', 'Marketing']}
          options={options}
          maxTagCount="responsive"
          style={{ width: 300 }}
          tagRender={(option, remove) => (
            <Tag closable onClose={remove}>
              {option.label}
            </Tag>
          )}
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Controlled popup with an extra action' : '受控浮层与附加操作'}
        </p>
        <Select
          options={options}
          open={open}
          onOpenChange={setOpen}
          labelRender={(option) => <strong>{option.label}</strong>}
          popupRender={(content) => (
            <>
              {content}
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                {english ? 'Done' : '完成'}
              </Button>
            </>
          )}
        />
      </div>
    </Space>
  );
}
