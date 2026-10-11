import { Space, Switch } from '@ifhover/leaf-ui';

export function SwitchBasic() {
  return (
    <Space wrap>
      <Switch defaultChecked>开启通知</Switch>
      <Switch>自动保存</Switch>
      <Switch disabled defaultChecked>
        已锁定
      </Switch>
      <Switch loading>正在保存设置</Switch>
    </Space>
  );
}
