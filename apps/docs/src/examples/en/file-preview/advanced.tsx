import { withBase } from '@rspress/core/runtime';
import { FilePreview, Segmented } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function FilePreviewTypes() {
  const [kind, setKind] = useState('Text');
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Segmented options={['Text', 'Image', 'Other format']} value={kind} onChange={setKind} />
      <FilePreview
        file={
          kind === 'Text'
            ? { url: withBase('/media/readme.txt'), name: 'readme.txt' }
            : kind === 'Image'
              ? { url: withBase('/media/landscape-1.svg'), name: 'landscape.svg' }
              : { url: withBase('/media/readme.txt'), name: 'document.docx' }
        }
        height={240}
      />
    </div>
  );
}
