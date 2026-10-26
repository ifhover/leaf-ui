import { Card, Grid } from '@ifhover/leaf-ui';

export function GridResponsive() {
  return (
    <Grid columns={{ xs: 1, sm: 2, lg: 3 }}>
      {['设计', '开发', '发布'].map((label) => (
        <Card key={label}>{label}</Card>
      ))}
    </Grid>
  );
}
