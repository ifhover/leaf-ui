import { Switch } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SwitchControlled() {
  const [checked, setChecked] = useState(true);
  return (
    <div className="leaf-demo-stack">
      <Switch checked={checked} onChange={(event) => setChecked(event.target.checked)}>
        Receive email
      </Switch>
      <span className="leaf-demo-note" aria-live="polite">
        {checked ? 'Email notifications enabled' : 'Email notifications disabled'}
      </span>
      <div className="leaf-demo-row">
        <Switch size="sm" defaultChecked>
          Small
        </Switch>
        <Switch defaultChecked>Default</Switch>
        <Switch size="lg" defaultChecked>
          Large
        </Switch>
      </div>
    </div>
  );
}
