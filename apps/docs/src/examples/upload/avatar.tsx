import { AvatarUpload, type UploadRequest } from '@ifhover/leaf-ui';

const simulateUpload = ({ signal }: UploadRequest) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, 1500);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });

export function UploadAvatar() {
  return <AvatarUpload maxSize={5 * 1024 * 1024} customRequest={simulateUpload} />;
}
