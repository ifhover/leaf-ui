import { Button, Tooltip } from '@sudden3/leaf-ui';
import { Info } from 'lucide-react';
export function TooltipBasic() {
  return (
    <div className="leaf-demo-row">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip
          key={placement}
          placement={placement}
          content="Save changes to the current project"
        >
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
      <Tooltip content="This setting applies to all projects">
        <Button variant="ghost" startIcon={<Info />} aria-label="Settings information" />
      </Tooltip>
    </div>
  );
}
