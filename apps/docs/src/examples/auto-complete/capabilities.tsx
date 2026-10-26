import { AutoComplete, Flex, Form, FormField, Text } from '@ifhover/leaf-ui';

const options = [
  {
    label: '团队',
    options: [
      {
        value: 'alice@example.com',
        label: (
          <Flex gap={8} align="center">
            <Text strong>Alice</Text>
            <Text tone="muted">设计</Text>
          </Flex>
        ),
        searchLabel: 'Alice 设计',
      },
      {
        value: 'bob@example.com',
        label: (
          <Flex gap={8} align="center">
            <Text strong>Bob</Text>
            <Text tone="muted">工程</Text>
          </Flex>
        ),
        searchLabel: 'Bob 工程',
      },
    ],
  },
];

export function Capabilities() {
  return (
    <Form layout="vertical">
      <FormField label="团队邮箱">
        <AutoComplete aria-label="团队邮箱" options={options} placeholder="搜索姓名或职责" />
      </FormField>
    </Form>
  );
}
