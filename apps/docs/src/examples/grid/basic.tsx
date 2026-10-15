import { Card, Grid } from '@ifhover/leaf-ui';
export function GridBasic() {
  return (
    <Grid columns={{ xs: 1, sm: 2, lg: 3 }} gap={16}>
      {['设计', '开发', '发布'].map((label) => (
        <Card key={label}>{label}</Card>
      ))}
    </Grid>
  );
}
