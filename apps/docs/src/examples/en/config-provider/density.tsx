import { ConfigProvider, Flex, Form, FormField, Input, Select, Text } from '@ifhover/leaf-ui';

export function ConfigProviderDensity() {
  return (
    <Flex direction="column" gap="lg">
      {(['comfortable', 'compact'] as const).map((density) => (
        <ConfigProvider key={density} density={density}>
          <Flex direction="column" gap="sm">
            <Text tone="muted">{density === 'compact' ? 'Compact' : 'Comfortable'}</Text>
            <Form onSubmit={(event) => event.preventDefault()}>
              <FormField label="Project name">
                <Input defaultValue="Leaf UI" />
              </FormField>
              <FormField label="Owner">
                <Select
                  defaultValue="lin"
                  options={[
                    { value: 'lin', label: 'Lin' },
                    { value: 'alex', label: 'Alex' },
                  ]}
                />
              </FormField>
            </Form>
          </Flex>
        </ConfigProvider>
      ))}
    </Flex>
  );
}
