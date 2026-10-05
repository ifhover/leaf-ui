import { withBase } from '@rspress/core/runtime';
import { type FileItem, FileList } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function FileListActions() {
  const [items, setItems] = useState<FileItem[]>([
    { uid: 'a', url: 'https://github.com/ifhover/leaf-ui/archive/refs/heads/main.zip' },
    { uid: 'b', url: withBase('/media/file-list-readme.md') },
    { uid: 'c', url: withBase('/media/empty.txt'), size: 0 },
  ]);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <p className="leaf-demo-note">
        名称可以从 URL 获取，文件大小可不提供。零字节文件也会展示大小。
      </p>
      <FileList
        items={items}
        removable
        onRemove={(file) => setItems((current) => current.filter((item) => item.uid !== file.uid))}
      />
    </div>
  );
}
