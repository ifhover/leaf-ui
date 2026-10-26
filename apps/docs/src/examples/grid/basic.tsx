import { Card, Grid } from '@ifhover/leaf-ui';

export function GridBasic() {
  return (
    <Grid>
      {[1, 2, 3].map((number) => (
        <Card key={number}>{number}</Card>
      ))}
    </Grid>
  );
}
