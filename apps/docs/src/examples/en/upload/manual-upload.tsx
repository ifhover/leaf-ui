import {
  Button,
  Flex,
  Upload,
  type UploadFile,
  type UploadHandle,
  type UploadRequest,
} from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const simulateUpload = ({ signal }: UploadRequest) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, 1500);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });

export function ManualUpload() {
  const upload = useRef<UploadHandle>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const uploading = files.some((file) => file.status === 'uploading');
  const canUpload = files.some(
    (file) => file.originFile && ['ready', 'error', 'cancelled'].includes(file.status ?? 'ready'),
  );
  return (
    <Flex direction="column" gap="md">
      <Upload
        ref={upload}
        fileList={files}
        onChange={setFiles}
        autoUpload={false}
        customRequest={simulateUpload}
      />
      <Flex gap="sm" wrap>
        <Button disabled={!canUpload || uploading} onClick={() => upload.current?.upload()}>
          Start upload
        </Button>
        <Button disabled={!uploading} onClick={() => upload.current?.abort()} variant="outline">
          Cancel uploads
        </Button>
      </Flex>
    </Flex>
  );
}
