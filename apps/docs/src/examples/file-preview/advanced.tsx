import { withBase } from '@rspress/core/runtime';
import { FilePreview, Segmented } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function FilePreviewTypes() {
  const [kind, setKind] = useState('文本');
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Segmented options={['文本', '图片', '其他格式']} value={kind} onChange={setKind} />
      <FilePreview
        file={
          kind === '文本'
            ? { url: withBase('/media/readme.txt'), name: 'readme.txt' }
            : kind === '图片'
              ? { url: withBase('/media/landscape-1.svg'), name: 'landscape.svg' }
              : { url: withBase('/media/readme.txt'), name: 'document.docx' }
        }
        height={240}
      />
    </div>
  );
}
