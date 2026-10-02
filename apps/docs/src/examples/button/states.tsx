import { Button } from '@leaf-ui/react';

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
