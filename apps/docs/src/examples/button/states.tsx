import { Button } from '@sudden3/leaf-ui';

export function ButtonStates() {
  return (
    <>
      <Button disabled>暂不可用</Button>
      <Button loading>加载中</Button>
      <Button variant="outline" disabled>
        已禁用
      </Button>
    </>
  );
}
