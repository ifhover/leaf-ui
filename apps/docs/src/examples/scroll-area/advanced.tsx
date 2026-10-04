import { Card, ScrollArea, Space } from '@sudden3/leaf-ui';

export function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" style={{ width: '100%' }} aria-label="横向卡片">
      <Space size={12}>
        {['A', 'B', 'C', 'D', 'E'].map((name) => (
          <Card key={name} title={name} style={{ width: 180, flex: 'none' }}>
            横向浏览内容
          </Card>
        ))}
      </Space>
    </ScrollArea>
  );
}
