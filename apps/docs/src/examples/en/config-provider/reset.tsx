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
        <FormField label="Inherited defaults">
          <Input defaultValue="Read-only content" />
        </FormField>
        <ConfigProvider components={{ Input: null }}>
          <FormField label="Cleared defaults">
            <Input defaultValue="Editable content" />
          </FormField>
        </ConfigProvider>
      </Form>
    </ConfigProvider>
  );
}
