import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
import { Info } from 'lucide-react';
export function TooltipBasic() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip key={placement} placement={placement} content="保存当前项目的修改">
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
      <Tooltip content="该设置将应用到所有项目">
        <Button startIcon={<Info />} aria-label="设置说明" />
      </Tooltip>
    </Flex>
  );
}
