import { Button, Flex, Upload, type UploadHandle, type UploadRequest } from '@ifhover/leaf-ui';
import { useRef } from 'react';

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
  return (
    <Flex direction="column" gap="md">
      <Upload ref={upload} autoUpload={false} customRequest={simulateUpload} />
      <Flex gap="sm" wrap>
        <Button onClick={() => upload.current?.upload()}>Start upload</Button>
        <Button onClick={() => upload.current?.abort()} variant="outline">
          Cancel uploads
        </Button>
      </Flex>
    </Flex>
  );
}
