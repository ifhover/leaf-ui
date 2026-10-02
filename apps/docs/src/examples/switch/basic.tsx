import { Switch } from '@leaf-ui/react';

export function SwitchBasic() {
  return (
    <>
      <Switch defaultChecked>开启通知</Switch>
      <Switch>自动保存</Switch>
      <Switch disabled defaultChecked>
        已锁定
      </Switch>
      <Switch loading aria-label="正在保存设置" />
    </>
  );
}
