import {
  ConfigProvider,
  Form,
  FormField,
  Input,
  type LeafComponentDefaults,
} from '@ifhover/leaf-ui';

const defaults = { Input: { readOnly: true } } satisfies LeafComponentDefaults;

export function ConfigProviderReset() {
  return (
    <ConfigProvider components={defaults}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="继承默认参数">
          <Input defaultValue="只读内容" />
        </FormField>
        <ConfigProvider components={{ Input: null }}>
          <FormField label="清除继承">
            <Input defaultValue="可以编辑" />
          </FormField>
        </ConfigProvider>
      </Form>
    </ConfigProvider>
  );
}
