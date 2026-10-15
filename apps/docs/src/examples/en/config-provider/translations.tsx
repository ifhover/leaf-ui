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
import mars from '../../config-provider/zh-CN-x-mars.json';

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
