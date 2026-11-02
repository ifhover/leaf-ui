import { Upload, type UploadFile } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function UploadControlled() {
  const [files, setFiles] = useState<UploadFile[]>([
    {
      uid: 'saved-notes',
      name: '项目笔记.txt',
      url: 'data:text/plain,Project%20notes',
      status: 'done',
    },
  ]);

  return <Upload multiple fileList={files} onChange={setFiles} />;
}
