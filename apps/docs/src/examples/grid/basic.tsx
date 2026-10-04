import { Grid } from '@sudden3/leaf-ui';

export function GridBasic() {
  return (
    <Grid style={{ width: '100%' }} columns={{ xs: 1, sm: 2, lg: 3 }} gap={16}>
      {['设计', '开发', '发布'].map((label) => (
        <div
          key={label}
          style={{
            padding: 24,
            background: 'var(--leaf-color-surface-muted)',
            borderRadius: 'var(--leaf-radius)',
          }}
        >
          {label}
        </div>
      ))}
    </Grid>
  );
}
