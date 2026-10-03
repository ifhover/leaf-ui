import { Switch } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <div className="leaf-demo-stack">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        接收邮件
      </Switch>
      <span className="leaf-demo-note" aria-live="polite">
        {checked ? '邮件通知已开启' : '邮件通知已关闭'}
      </span>
      <div className="leaf-demo-row">
        <Switch size="sm" defaultChecked>
          小尺寸
        </Switch>
        <Switch defaultChecked>默认尺寸</Switch>
        <Switch size="lg" defaultChecked>
          大尺寸
        </Switch>
      </div>
    </div>
  );
}
