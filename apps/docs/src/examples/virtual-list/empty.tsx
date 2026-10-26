import { Text, VirtualList } from '@ifhover/leaf-ui';

const items: { id: number; name: string }[] = [];

export function VirtualListEmpty() {
  return (
    <VirtualList
      items={items}
      itemKey={(item) => item.id}
      height={240}
      role="region"
      aria-label="空项目列表"
      renderItem={(item) => <Text>{item.name}</Text>}
    />
  );
}
