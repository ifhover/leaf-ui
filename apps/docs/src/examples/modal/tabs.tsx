import { Button, Modal, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalTabs() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>项目配置</Button>
      <Modal
        open={open}
        title="项目配置"
        divided={false}
        onClose={() => setOpen(false)}
        tabs={{
          items: [
            {
              key: 'general',
              label: '基本信息',
              children: <Text>在独立标签页中展示配置表单或详情。</Text>,
            },
            {
              key: 'members',
              label: '成员权限',
              children: <Text>标签栏固定在正文上方，内容超长时仅正文区滚动。</Text>,
            },
          ],
        }}
      />
    </>
  );
}
