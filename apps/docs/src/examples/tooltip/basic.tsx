import { Button, Tooltip } from '@sudden3/leaf-ui';
import { Info } from 'lucide-react';
export function TooltipBasic() {
  return (
    <div className="leaf-demo-row">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip key={placement} placement={placement} content="保存当前项目的修改">
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
      <Tooltip content="该设置将应用到所有项目">
        <Button variant="ghost" startIcon={<Info />} aria-label="设置说明" />
      </Tooltip>
    </div>
  );
}
