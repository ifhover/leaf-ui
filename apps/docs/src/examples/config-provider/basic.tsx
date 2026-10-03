import { Button, ConfigProvider, DatePicker, Select, Switch, useMessage } from '@sudden3/leaf-ui';
import { useState } from 'react';

function Region() {
  const { message, contextHolder } = useMessage();
  return (
    <div className="leaf-demo-row">
      <Select aria-label="选项" options={[]} />
      <DatePicker aria-label="日期" />
      <Button onClick={() => message.success('Success / 操作成功')}>Message</Button>
      {contextHolder}
    </div>
  );
}
export function ConfigProviderBasic() {
  const [english, setEnglish] = useState(true);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
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
    </div>
  );
}
