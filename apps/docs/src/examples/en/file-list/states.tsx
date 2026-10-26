import { FileList } from '@ifhover/leaf-ui';

export function FileListStates() {
  return (
    <FileList
      items={[
        {
          uid: 'uploading',
          name: 'Introduction.mp4',
          size: 12582912,
          status: 'uploading',
          percent: 42,
        },
        { uid: 'done', name: 'Delivery notes.pdf', size: 245760, status: 'done' },
        {
          uid: 'error',
          name: 'Attachments.zip',
          size: 3145728,
          status: 'error',
          error: 'Connection lost.',
        },
        { uid: 'ready', name: 'Project notes.md', status: 'ready' },
        { uid: 'cancelled', name: 'Backup.zip', status: 'cancelled' },
      ]}
    />
  );
}
