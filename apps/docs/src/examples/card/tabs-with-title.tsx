import { Button, Card, Descriptions, Flex, Form, FormField, Input, Tag } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function CardTabsWithTitle() {
  const [activeKey, setActiveKey] = useState('settings');
  const [saved, setSaved] = useState(false);
  const formId = useId();
  return (
    <Card
      title="项目设置"
      description="管理项目资料与团队成员。"
      extra={<Tag>{saved ? '已保存' : '草稿'}</Tag>}
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
                <FormField label="联系邮箱">
                  <Input name="email" type="email" defaultValue="team@example.com" required />
                </FormField>
              </Form>
            ),
          },
          {
            key: 'members',
            label: '团队成员',
            children: (
              <Descriptions
                columns={1}
                items={[
                  { key: 'owner', label: '项目负责人', children: '林若' },
                  { key: 'designer', label: '设计师', children: '陈安' },
                ]}
              />
            ),
          },
          { key: 'billing', label: '账单', disabled: true, children: null },
        ],
      }}
      footer={
        <Flex align="center" gap="sm" justify="end">
          <Button type="submit" form={formId} disabled={activeKey !== 'settings'}>
            保存修改
          </Button>
        </Flex>
      }
    />
  );
}
