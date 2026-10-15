import { FileList } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function FileListStates() {
  return (
    <div>
      <FileList
        downloadable={false}
        previewable={false}
        items={[
          {
            uid: 'uploading',
            name: 'Project introduction.mp4',
            size: 12582912,
            status: 'uploading',
            percent: 42,
          },
          {
            uid: 'done',
            name: 'Delivery notes.pdf',
            size: 685,
            status: 'done',
            url: withBase('/media/sample.pdf'),
          },
          {
            uid: 'error',
            name: 'Attachments.zip',
            size: 3145728,
            status: 'error',
            error: 'Connection interrupted. Please upload again.',
          },
          { uid: 'ready', name: 'Project notes.md', status: 'ready' },
          { uid: 'cancelled', name: 'Backup.zip', status: 'cancelled' },
        ]}
      />
    </div>
  );
}
