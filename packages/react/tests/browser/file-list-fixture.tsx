import { Button, type FileItem, FileList, Upload, type UploadRequest } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const photo = new URL(
  '../../../../apps/docs/docs/public/media/landscape-1.svg?no-inline',
  import.meta.url,
).href;
const secondPhoto = new URL(
  '../../../../apps/docs/docs/public/media/landscape-2.svg?no-inline',
  import.meta.url,
).href;
const longName = 'Project handover documentation with a deliberately long filename final.pdf';
const initial: FileItem[] = [
  { uid: 'report', name: 'Project proposal.pdf', url: '/report.pdf', size: 2457600 },
  { uid: 'photo', name: 'Summer landscape.svg', url: photo, size: 414 },
  {
    uid: 'long',
    name: longName,
    url: '/handover.pdf',
    status: 'error',
    error: 'Connection interrupted. Please retry the upload before downloading this attachment.',
  },
  { uid: 'data', name: 'Quarterly data.csv', url: '/data.csv' },
];
const pictures: FileItem[] = [
  { uid: 'photo', name: 'Summer landscape.svg', url: photo, size: 414 },
  { uid: 'trail', name: 'Mountain trail.svg', url: secondPhoto },
  { uid: 'archive', name: 'Project attachments.zip', url: '/attachments.zip', size: 3145728 },
];

export function FileListFixture() {
  const [files, setFiles] = useState(initial);
  const [removing, setRemoving] = useState(false);
  const finishRemoval = useRef<() => void>(() => {});
  const attempted = useRef(new Set<string>());
  const request = useRef<UploadRequest | null>(null);
  const rejectUpload = useRef<(reason: Error) => void>(() => {});
  return (
    <div className="file-list-fixture">
      <h1>File lists</h1>
      <section aria-label="File information">
        <h2>File information</h2>
        <FileList
          items={files}
          removable
          onRemove={async (file) => {
            await new Promise<void>((resolve) => {
              finishRemoval.current = resolve;
              setRemoving(true);
            });
            if (file.uid === 'report' && !attempted.current.has(file.uid)) {
              attempted.current.add(file.uid);
              throw new Error('Removal failed. Please try again.');
            }
            setFiles((current) => current.filter((item) => item.uid !== file.uid));
          }}
        />
        {removing && (
          <Button
            variant="outline"
            onClick={() => {
              setRemoving(false);
              finishRemoval.current();
            }}
          >
            Complete removal
          </Button>
        )}
      </section>
      <section aria-label="Thumbnails">
        <h2>Thumbnails</h2>
        <FileList listType="picture" items={pictures} />
      </section>
      <section aria-label="Picture cards">
        <h2>Picture cards</h2>
        <FileList listType="picture-card" items={pictures} />
      </section>
      <section aria-label="Status and empty">
        <h2>Status and empty</h2>
        <FileList
          downloadable={false}
          items={[
            {
              uid: 'upload',
              name: 'Introduction.mp4',
              status: 'uploading',
              percent: 42,
              size: 12582912,
            },
            { uid: 'done', name: 'Delivery notes.pdf', status: 'done' },
            { uid: 'ready', name: 'Project notes.md', status: 'ready' },
            { uid: 'cancelled', name: 'Backup.zip', status: 'cancelled' },
          ]}
        />
        <FileList items={[]} />
      </section>
      <section aria-label="Disabled actions">
        <h2>Disabled actions</h2>
        <FileList items={[pictures[0] as FileItem]} removable onRemove={() => {}} disabled />
      </section>
      <section aria-label="Upload integration">
        <h2>Upload integration</h2>
        <Upload
          multiple
          customRequest={(entry) => {
            request.current = entry;
            return new Promise((_, reject) => {
              rejectUpload.current = reject;
            });
          }}
        />
        <Button variant="outline" onClick={() => request.current?.onProgress(60)}>
          Advance upload
        </Button>
        <Button
          variant="outline"
          onClick={() => rejectUpload.current(new Error('Upload connection failed.'))}
        >
          Fail upload
        </Button>
      </section>
    </div>
  );
}
