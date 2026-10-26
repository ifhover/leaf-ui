import { Button, useMessage } from '@ifhover/leaf-ui';

export function MessageBasic() {
  const { message } = useMessage();
  return <Button onClick={() => message.info('更改已保存')}>显示消息</Button>;
}
