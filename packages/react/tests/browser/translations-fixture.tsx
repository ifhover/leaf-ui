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
  useMessage,
  useNotification,
} from '@ifhover/leaf-ui';
import { useState } from 'react';
import { useLeafConfig } from '../../src/config-provider/context';

function Controls() {
  const { locale } = useLeafConfig();
  const { confirm } = useConfirm();
  const { message } = useMessage();
  const notification = useNotification();
  return (
    <Space direction="vertical" align="stretch">
      <output aria-label="Current locale">{locale}</output>
      <Form>
        <FormField label="Choice">
          <Select options={[]} allowClear />
        </FormField>
        <FormField label="Date">
          <DatePicker defaultValue={new Date(2026, 9, 16)} />
        </FormField>
        <FormField label="Time">
          <DatePicker picker="time" use12Hours defaultValue="14:30" />
        </FormField>
      </Form>
      <Pagination total={21} showTotal />
      <Space>
        <Button
          onClick={() =>
            void confirm({ title: 'Continue?', children: 'Your changes will be saved.' })
          }
        >
          Confirm
        </Button>
        <Button
          variant="outline"
          onClick={() => message.open({ content: 'Saved', closable: true, duration: 0 })}
        >
          Message
        </Button>
        <Button
          variant="outline"
          onClick={() => notification.open({ title: 'Notice', duration: 0 })}
        >
          Notification
        </Button>
      </Space>
    </Space>
  );
}
export function TranslationsFixture() {
  const [locale, setLocale] = useState('ja-JP');
  return (
    <Space direction="vertical" align="stretch">
      <Space>
        <Button onClick={() => setLocale('ja-JP')}>Japanese</Button>
        <Button onClick={() => setLocale('ko-KR')}>Korean</Button>
        <Button onClick={() => setLocale('en-US')}>English</Button>
      </Space>
      <ConfigProvider data-testid="translations" locale={[locale, 'en-US']}>
        <Controls />
        <ConfigProvider
          data-testid="nested"
          translations={{ 'ja-JP': { select: { empty: '候補なし' } } }}
        >
          <Select aria-label="Nested choice" options={[]} />
        </ConfigProvider>
      </ConfigProvider>
    </Space>
  );
}
