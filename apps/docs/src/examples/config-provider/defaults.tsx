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
        Input: { placeholder: '请输入项目名称', allowClear: true },
        DatePicker: { placeholder: '选择项目开始日期', allowClear: true },
      }}
    >
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="项目名称">
          <Input />
        </FormField>
        <FormField label="开始日期">
          <DatePicker />
        </FormField>
        <FormField label="结束日期">
          <DatePicker placeholder="实例覆盖：选择结束日期" />
        </FormField>
        <Space wrap>
          <Button type="reset">重置</Button>
          <Button type="submit" variant="solid">
            保存（实例覆盖）
          </Button>
        </Space>
      </Form>
    </ConfigProvider>
  );
}
