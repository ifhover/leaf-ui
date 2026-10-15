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
      <Form>
        <FormField label="继承默认参数">
          <Input defaultValue="此输入框为只读" />
        </FormField>
        <ConfigProvider components={{ Input: null }}>
          <FormField label="清除当前区域的默认参数">
            <Input defaultValue="试试修改这里的内容" />
          </FormField>
        </ConfigProvider>
      </Form>
    </ConfigProvider>
  );
}
