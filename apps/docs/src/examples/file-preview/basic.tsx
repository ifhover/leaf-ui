import { withBase } from '@rspress/core/runtime';
import { FilePreview } from '@sudden3/leaf-ui';

export function FilePreviewBasic() {
  return (
    <FilePreview
      file={{
        url: withBase('/media/sample.pdf'),
        name: 'Leaf UI.pdf',
        contentType: 'application/pdf',
      }}
      workerSrc={withBase('/media/pdf.worker.min.mjs')}
      height={420}
    />
  );
}
