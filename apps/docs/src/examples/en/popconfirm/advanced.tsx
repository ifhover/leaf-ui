import { Button, Popconfirm } from '@sudden3/leaf-ui';

export function PopconfirmAsync() {
  return (
    <Popconfirm
      title="Submit for review?"
      type="info"
      onConfirm={() => new Promise<void>((resolve) => setTimeout(resolve, 900))}
    >
      <Button>Async confirmation</Button>
    </Popconfirm>
  );
}
