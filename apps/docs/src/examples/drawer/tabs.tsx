import { Button, Descriptions, Drawer, Paragraph } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DrawerTabs() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>查看服务详情</Button>
      <Drawer
        open={open}
        title="API 网关"
        onClose={() => setOpen(false)}
        tabs={{
          items: [
            {
              key: 'overview',
              label: '概览',
              children: (
                <Descriptions
                  items={[
                    { key: 'region', label: '区域', children: 'cn-east-1' },
                    { key: 'version', label: '版本', children: 'v2.4.0' },
                    { key: 'owner', label: '负责人', children: '基础平台组' },
                  ]}
                />
              ),
            },
            {
              key: 'changelog',
              label: '变更记录',
              children: <Paragraph>最近一次发布启用了连接池自动缩容。</Paragraph>,
            },
          ],
        }}
      />
    </>
  );
}
