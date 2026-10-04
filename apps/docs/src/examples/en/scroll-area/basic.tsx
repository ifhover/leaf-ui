import { ScrollArea } from '@sudden3/leaf-ui';

export function ScrollAreaBasic() {
  return (
    <ScrollArea height={180} aria-label="Project list">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={String(i)} style={{ padding: '12px 16px' }}>
          Project {i + 1}
        </div>
      ))}
    </ScrollArea>
  );
}
