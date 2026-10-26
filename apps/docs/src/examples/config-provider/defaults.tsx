import { ConfigProvider, Form, FormField, Input } from '@ifhover/leaf-ui';

export function ConfigProviderDefaults() {
  return (
    <ConfigProvider components={{ Input: { placeholder: '请输入名称', allowClear: true } }}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="继承默认参数">
          <Input />
        </FormField>
        <FormField label="实例覆盖">
          <Input placeholder="请输入团队名称" />
        </FormField>
      </Form>
    </ConfigProvider>
  );
}
