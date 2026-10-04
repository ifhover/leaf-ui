import { Card, Masonry } from '@sudden3/leaf-ui';

export function MasonryBasic() {
  return (
    <Masonry columns={{ xs: 1, sm: 2, lg: 3 }} gap={16}>
      {[100, 160, 120, 180, 110, 140].map((height, index) => (
        <Card key={height} title={`Idea ${index + 1}`}>
          <div style={{ height }}>Cards of different heights</div>
        </Card>
      ))}
    </Masonry>
  );
}
