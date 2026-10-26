import { Button, Card, Flex, Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function CardTabsWithTitle() {
  const [activeKey, setActiveKey] = useState('settings');
  const [saved, setSaved] = useState(false);
  const formId = useId();
  return (
    <Card
      title="项目设置"
      tabs={{
        activeKey,
        onChange: setActiveKey,
        items: [
          {
            key: 'settings',
            label: '基本信息',
            children: (
              <Form
                id={formId}
                layout="vertical"
                onChange={() => setSaved(false)}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSaved(true);
                }}
              >
                <FormField label="项目名称">
                  <Input name="name" defaultValue="Leaf 设计系统" required />
                </FormField>
              </Form>
            ),
          },
          {
            key: 'notes',
            label: '说明',
            children: <Text>修改项目名称后，在基本信息中保存。</Text>,
          },
        ],
      }}
      footer={
        <Flex align="center" gap="sm" justify="space-between" wrap>
          <Text role="status" tone="muted">
            {saved ? '已保存' : '尚未保存'}
          </Text>
          <Button type="submit" form={formId} disabled={activeKey !== 'settings'}>
            保存修改
          </Button>
        </Flex>
      }
    />
  );
}
