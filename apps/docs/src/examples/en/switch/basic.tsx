import { Space, Switch } from '@ifhover/leaf-ui';

export function SwitchBasic() {
  return (
    <Space wrap>
      <Switch defaultChecked>Enable notifications</Switch>
      <Switch>Autosave</Switch>
      <Switch disabled defaultChecked>
        Locked
      </Switch>
      <Switch loading>Saving settings</Switch>
    </Space>
  );
}
