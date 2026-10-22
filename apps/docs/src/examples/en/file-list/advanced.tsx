import { type FileItem, FileList, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const textFile = (text: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;

export function FileListActions() {
  const [items, setItems] = useState<FileItem[]>([
    { uid: 'a', url: 'https://github.com/ifhover/leaf-ui/archive/refs/heads/main.zip' },
    {
      uid: 'b',
      url: textFile('# Delivery notes\n\n- Design files and exports\n- Version 1.0'),
      name: 'Delivery notes.md',
    },
    { uid: 'c', url: textFile(''), name: 'empty.txt', size: 0 },
  ]);
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">
        Names can be omitted and read from the URL, or supplied explicitly; size is optional.
        Zero-byte files still display their size.
      </Text>
      <FileList
        items={items}
        removable
        onRemove={(file) => setItems((current) => current.filter((item) => item.uid !== file.uid))}
      />
    </Space>
  );
}
