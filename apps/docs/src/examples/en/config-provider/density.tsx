import {
  Button,
  ConfigProvider,
  Form,
  FormField,
  Input,
  Select,
  Space,
  Text,
} from '@ifhover/leaf-ui';

export function ConfigProviderDensity() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      {(['comfortable', 'compact'] as const).map((density) => (
        <ConfigProvider key={density} density={density}>
          <Space direction="vertical" align="stretch">
            <Text tone="muted">{density === 'compact' ? 'Compact' : 'Comfortable'}</Text>
            <Form>
              <FormField label="Project name">
                <Input defaultValue="Leaf UI" />
              </FormField>
              <FormField label="Owner">
                <Select
                  options={[
                    { value: 'lin', label: 'Lin' },
                    { value: 'alex', label: 'Alex' },
                  ]}
                  defaultValue="lin"
                />
              </FormField>
              <Button type="reset" variant="outline">
                Reset
              </Button>
            </Form>
          </Space>
        </ConfigProvider>
      ))}
    </Space>
  );
}
