import { Button, Popover, Space } from '@ifhover/leaf-ui';
export function PopoverPlacements() {
  return (
    <Space wrap className="leaf-demo-row">
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Popover
          key={placement}
          placement={placement}
          title="项目提示"
          content="浮层会根据可用空间调整位置。"
        >
          <Button variant="outline">
            {{ top: '上方', bottom: '下方', left: '左侧', right: '右侧' }[placement]}
          </Button>
        </Popover>
      ))}
    </Space>
  );
}
