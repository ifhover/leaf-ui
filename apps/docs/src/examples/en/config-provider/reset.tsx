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
        <FormField label="Inherited defaults">
          <Input defaultValue="This input is read-only" />
        </FormField>
        <ConfigProvider components={{ Input: null }}>
          <FormField label="Clear defaults in this region">
            <Input defaultValue="Try editing this text" />
          </FormField>
        </ConfigProvider>
      </Form>
    </ConfigProvider>
  );
}
