import { type FileItem, FileList } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FileListActions() {
  const [items, setItems] = useState<FileItem[]>([
    { uid: 'plan', name: 'Project plan.pdf', size: 245760 },
    { uid: 'notes', name: 'Project notes.md', size: 1024 },
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
