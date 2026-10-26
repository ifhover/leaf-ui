import { ConfigProvider, Form, FormField, Input } from '@ifhover/leaf-ui';

export function ConfigProviderDefaults() {
  return (
    <ConfigProvider components={{ Input: { placeholder: 'Enter a name', allowClear: true } }}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="Inherited defaults">
          <Input />
        </FormField>
        <FormField label="Instance override">
          <Input placeholder="Enter a team name" />
        </FormField>
      </Form>
    </ConfigProvider>
  );
}
