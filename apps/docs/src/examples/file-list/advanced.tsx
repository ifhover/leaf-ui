import { type FileItem, FileList } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FileListActions() {
  const [items, setItems] = useState<FileItem[]>([
    { uid: 'plan', name: '项目方案.pdf', size: 245760 },
    { uid: 'notes', name: '项目笔记.md', size: 1024 },
  ]);
  return (
    <FileList
      items={items}
      removable
      onRemove={async (file) => {
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
        setItems((current) => current.filter((item) => item.uid !== file.uid));
      }}
    />
  );
}
