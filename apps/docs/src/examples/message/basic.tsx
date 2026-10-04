import { Button, useMessage } from '@sudden3/leaf-ui';
export function MessageBasic() {
  const { message } = useMessage();
  async function save() {
    const key = message.loading('正在保存');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    message.open({ key, type: 'success', content: '保存成功', duration: 3, closable: true });
  }
  return (
    <div className="leaf-demo-row">
      <Button onClick={save}>异步保存</Button>
      <Button variant="outline" onClick={() => message.info('一条消息提示')}>
        提示
      </Button>
      <Button danger variant="soft" onClick={() => message.error('操作失败，请重试')}>
        错误
      </Button>
      <Button variant="soft" onClick={() => message.success('操作成功')}>
        成功
      </Button>
      <Button variant="outline" onClick={() => message.warning('请检查输入内容')}>
        警告
      </Button>
      <Button variant="ghost" onClick={() => message.close()}>
        清空消息
      </Button>
    </div>
  );
}
