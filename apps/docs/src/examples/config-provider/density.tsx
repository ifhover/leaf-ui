import { ConfigProvider, Flex, Form, FormField, Input, Select, Text } from '@ifhover/leaf-ui';

export function ConfigProviderDensity() {
  return (
    <Flex direction="column" gap="lg">
      {(['comfortable', 'compact'] as const).map((density) => (
        <ConfigProvider key={density} density={density}>
          <Flex direction="column" gap="sm">
            <Text tone="muted">{density === 'compact' ? '紧凑' : '舒适'}</Text>
            <Form onSubmit={(event) => event.preventDefault()}>
              <FormField label="项目名称">
                <Input defaultValue="Leaf UI" />
              </FormField>
              <FormField label="负责人">
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
