import { Upload, type UploadRequest } from '@ifhover/leaf-ui';

const simulateUpload = ({ signal, onProgress }: UploadRequest) =>
  new Promise<void>((resolve, reject) => {
    let percent = 0;
    const cleanup = () => {
      clearInterval(timer);
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setInterval(() => {
      percent += 10;
      onProgress(Math.min(percent, 99));
      if (percent >= 100) {
        cleanup();
        resolve();
      }
    }, 300);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });

export function UploadDrag() {
  return <Upload drag multiple customRequest={simulateUpload} />;
}
