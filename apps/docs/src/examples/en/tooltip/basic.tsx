import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
import { Info } from 'lucide-react';
export function TooltipBasic() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
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
    </Flex>
  );
}
