import { Scrollbar } from '@ifhover/leaf-ui';
export function ScrollbarHorizontal({ english = false }: { english?: boolean }) {
  return (
    <Scrollbar
      orientation="horizontal"
      scrollbar="always"
      aria-label={english ? 'Project board' : '项目看板'}
    >
      <div style={{ display: 'flex', width: 'max-content', gap: 16, padding: '12px 12px 24px' }}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={String(index)}
            style={{
              width: 180,
              padding: 24,
              borderRadius: 'var(--leaf-radius)',
              background: 'var(--leaf-color-surface-muted)',
            }}
          >
            {english ? 'Project' : '项目'} {index + 1}
          </div>
        ))}
      </div>
    </Scrollbar>
  );
}
