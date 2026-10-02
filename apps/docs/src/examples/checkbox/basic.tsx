import { Checkbox } from '@leaf-ui/react';

export function CheckboxBasic() {
  return (
    <>
      <Checkbox defaultChecked>接收项目动态</Checkbox>
      <Checkbox>接收每周摘要</Checkbox>
      <Checkbox disabled>暂不可用</Checkbox>
      <Checkbox disabled defaultChecked>
        已锁定
      </Checkbox>
    </>
  );
}
