import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  FormField,
  Pagination,
  Select,
  Space,
  useConfirm,
} from '@ifhover/leaf-ui';

const mars = {
  common: { confirm: '確萣', cancel: '筭ㄋ' },
  select: { placeholder: '挑①個唄', empty: '暫蒔木洧選項' },
  datePicker: { placeholder: '選個ㄖ剘' },
  pagination: { total: '共 {total} 條數據' },
};

const translations = { 'zh-CN-x-mars': mars };

function Controls() {
  const { confirm } = useConfirm();
  return (
    <Space direction="vertical" align="stretch">
      <Form>
        <FormField label="Date">
          <DatePicker />
        </FormField>
        <FormField label="Empty options">
          <Select options={[]} />
        </FormField>
      </Form>
      <Pagination total={24} showTotal />
      <Button
        variant="outline"
        onClick={() =>
          void confirm({
            title: 'Continue?',
            children:
              'Confirm and Cancel use Martian text. Missing translations fall back to English.',
          })
        }
      >
        Open confirmation
      </Button>
    </Space>
  );
}

export function ConfigProviderTranslations() {
  return (
    <ConfigProvider locale={['zh-CN-x-mars', 'en-US']} translations={translations}>
      <Controls />
    </ConfigProvider>
  );
}
