import { Scrollbar } from '@ifhover/leaf-ui';
export function ScrollbarBasic({ english = false }: { english?: boolean }) {
  return (
    <Scrollbar height={200} aria-label={english ? 'Project activity' : '项目动态'}>
      {Array.from({ length: 12 }, (_, index) => (
        <div key={String(index)} style={{ padding: '12px 20px' }}>
          {english ? 'Project activity' : '项目动态'} {index + 1}
        </div>
      ))}
    </Scrollbar>
  );
}
