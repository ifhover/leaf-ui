import { AutoComplete, Flex, Form, FormField, Text } from '@ifhover/leaf-ui';

const options = [
  {
    label: 'Team',
    options: [
      {
        value: 'alice@example.com',
        label: (
          <Flex gap={8} align="center">
            <Text strong>Alice</Text>
            <Text tone="muted">Design</Text>
          </Flex>
        ),
        searchLabel: 'Alice Design',
      },
      {
        value: 'bob@example.com',
        label: (
          <Flex gap={8} align="center">
            <Text strong>Bob</Text>
            <Text tone="muted">Engineering</Text>
          </Flex>
        ),
        searchLabel: 'Bob Engineering',
      },
    ],
  },
];

export function Capabilities() {
  return (
    <Form layout="vertical">
      <FormField label="Team email">
        <AutoComplete
          aria-label="Team email"
          options={options}
          placeholder="Search a name or role"
        />
      </FormField>
    </Form>
  );
}
