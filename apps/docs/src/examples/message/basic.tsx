import { Button, Flex, useMessage } from '@ifhover/leaf-ui';
export function MessageBasic() {
  const { message } = useMessage();
  async function save() {
    const key = message.loading('正在保存');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    message.open({ key, type: 'success', content: '保存成功', duration: 3, closable: true });
  }
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Button onClick={save}>异步保存</Button>
      <Button variant="outline" onClick={() => message.info('一条消息提示')}>
        提示
      </Button>
      <Button danger variant="outline" onClick={() => message.danger('操作失败，请重试')}>
        错误
      </Button>
      <Button variant="outline" onClick={() => message.success('操作成功')}>
        成功
      </Button>
      <Button variant="outline" onClick={() => message.warning('请检查输入内容')}>
        警告
      </Button>
      <Button  onClick={() => message.close()}>
        清空消息
      </Button>
    </Flex>
  );
}
