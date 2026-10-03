import { Switch } from '@sudden3/leaf-ui';

export function SwitchBasic() {
  return (
    <>
      <Switch defaultChecked>Enable notifications</Switch>
      <Switch>Autosave</Switch>
      <Switch disabled defaultChecked>
        Locked
      </Switch>
      <Switch loading>Saving settings</Switch>
    </>
  );
}
