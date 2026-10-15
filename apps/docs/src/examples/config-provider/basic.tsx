import { Button, ConfigProvider, Form, FormField, Input, Select } from '@ifhover/leaf-ui';

export function ConfigProviderBasic() {
  return (
    <ConfigProvider theme={{ primaryColor: '#7654c6', borderRadius: 8 }}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="项目名称">
          <Input defaultValue="Leaf UI" />
        </FormField>
        <FormField label="项目类型">
          <Select
            defaultValue="website"
            options={[
              { value: 'website', label: '网站' },
              { value: 'app', label: '应用' },
            ]}
          />
        </FormField>
        <Button type="submit">保存设置</Button>
      </Form>
    </ConfigProvider>
  );
}
