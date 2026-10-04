import { Button, Popconfirm } from '@sudden3/leaf-ui';

export function PopconfirmAsync() {
  return (
    <Popconfirm
      title="提交审核？"
      type="info"
      onConfirm={() => new Promise<void>((resolve) => setTimeout(resolve, 900))}
    >
      <Button>异步确认</Button>
    </Popconfirm>
  );
}
