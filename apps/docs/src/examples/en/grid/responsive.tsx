import { Card, Grid } from '@ifhover/leaf-ui';

export function GridResponsive() {
  return (
    <Grid columns={{ xs: 1, sm: 2, lg: 3 }}>
      {['Design', 'Develop', 'Release'].map((label) => (
        <Card key={label}>{label}</Card>
      ))}
    </Grid>
  );
}
