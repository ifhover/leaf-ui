import { Card, Masonry } from '@sudden3/leaf-ui';

export function MasonryBasic() {
  return (
    <Masonry columns={{ xs: 1, sm: 2, lg: 3 }} gap={16}>
      {[100, 160, 120, 180, 110, 140].map((height, index) => (
        <Card key={height} title={`灵感 ${index + 1}`}>
          <div style={{ height }}>不同高度的卡片</div>
        </Card>
      ))}
    </Masonry>
  );
}
