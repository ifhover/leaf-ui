import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  FormField,
  Input,
  Space,
} from '@ifhover/leaf-ui';

export function ConfigProviderDefaults() {
  return (
    <ConfigProvider
      components={{
        Button: { variant: 'outline' },
        Input: { placeholder: 'Enter a project name', allowClear: true },
        DatePicker: { placeholder: 'Choose a project start date', allowClear: true },
      }}
    >
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="Project name">
          <Input />
        </FormField>
        <FormField label="Start date">
          <DatePicker />
        </FormField>
        <FormField label="End date">
          <DatePicker placeholder="Instance override: choose an end date" />
        </FormField>
        <Space wrap>
          <Button type="reset">Reset</Button>
          <Button type="submit" variant="solid">
            Save (instance override)
          </Button>
        </Space>
      </Form>
    </ConfigProvider>
  );
}
