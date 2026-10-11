import {
  Button,
  ConfigProvider,
  DatePicker,
  Select,
  Space,
  Switch,
  useConfirm,
  useMessage,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

function Region() {
  const { message } = useMessage();
  const { confirm } = useConfirm();
  return (
    <Space wrap className="leaf-demo-row">
      <Select aria-label="Options" options={[]} />
      <DatePicker aria-label="Date" />
      <Button onClick={() => message.success('Success / Completed')}>Message</Button>
      <Button
        variant="outline"
        onClick={() =>
          confirm({ title: 'Continue / 是否继续', children: 'Please review / 请查看提示内容' })
        }
      >
        Confirm
      </Button>
    </Space>
  );
}
export function ConfigProviderBasic() {
  const [english, setEnglish] = useState(true);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <Switch checked={english} onChange={(event) => setEnglish(event.target.checked)}>
        English
      </Switch>
      <ConfigProvider
        locale={english ? 'en-US' : 'zh-CN'}
        theme={{ primaryColor: '#7654c6', borderRadius: 4 }}
      >
        <Region />
      </ConfigProvider>
      <ConfigProvider theme={{ primaryColor: '#087f8c', borderRadius: 16 }}>
        <Region />
      </ConfigProvider>
    </Space>
  );
}
