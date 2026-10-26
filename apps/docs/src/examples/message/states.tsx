import { Button, Space, useMessage } from '@ifhover/leaf-ui';

export function MessageStates() {
  const { message } = useMessage();
  return (
    <Space wrap>
      <Button onClick={() => message.info('有一条新的评论')}>信息</Button>
      <Button onClick={() => message.success('更改已保存')}>成功</Button>
      <Button onClick={() => message.warning('还有未保存的更改')}>警告</Button>
      <Button onClick={() => message.danger('保存失败，请重试')}>失败</Button>
    </Space>
  );
}
