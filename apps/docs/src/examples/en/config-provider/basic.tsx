import { ConfigProvider, Form, FormField, Input, Select } from '@ifhover/leaf-ui';

export function ConfigProviderBasic() {
  return (
    <ConfigProvider theme={{ primaryColor: '#1d9bf0' }}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="Project name">
          <Input defaultValue="Leaf UI" />
        </FormField>
        <FormField label="Project type">
          <Select
            defaultValue="website"
            options={[
              { value: 'website', label: 'Website' },
              { value: 'app', label: 'Application' },
            ]}
          />
        </FormField>
      </Form>
    </ConfigProvider>
  );
}
