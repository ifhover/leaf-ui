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
        <FormField label="日期">
          <DatePicker />
        </FormField>
        <FormField label="空选项">
          <Select options={[]} />
        </FormField>
      </Form>
      <Pagination total={24} showTotal />
      <Button
        variant="outline"
        onClick={() =>
          void confirm({
            title: '继续操作？',
            children: '确认与取消按钮使用火星文，未翻译的文本回退英文。',
          })
        }
      >
        打开确认框
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
