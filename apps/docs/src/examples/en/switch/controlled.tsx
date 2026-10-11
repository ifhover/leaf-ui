import { Space, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        Receive email
      </Switch>
      <span className="leaf-demo-note" aria-live="polite">
        {checked ? 'Email notifications enabled' : 'Email notifications disabled'}
      </span>
      <Space wrap className="leaf-demo-row">
        <Switch size="sm" defaultChecked>
          Small
        </Switch>
        <Switch defaultChecked>Default</Switch>
        <Switch size="lg" defaultChecked>
          Large
        </Switch>
      </Space>
    </Space>
  );
}
