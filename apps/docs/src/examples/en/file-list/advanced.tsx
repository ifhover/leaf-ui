import { type FileItem, FileList, Space, Text } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
import { useState } from 'react';
export function FileListActions() {
  const [items, setItems] = useState<FileItem[]>([
    { uid: 'a', url: 'https://github.com/ifhover/leaf-ui/archive/refs/heads/main.zip' },
    { uid: 'b', url: withBase('/media/file-list-readme.md') },
    { uid: 'c', url: withBase('/media/empty.txt'), size: 0 },
  ]);
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">
        Names can come from the URL; size is optional. Zero-byte files still display their size.
      </Text>
      <FileList
        items={items}
        removable
        onRemove={(file) => setItems((current) => current.filter((item) => item.uid !== file.uid))}
      />
    </Space>
  );
}
