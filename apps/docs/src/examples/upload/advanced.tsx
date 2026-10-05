import { Upload, type UploadRequest } from '@sudden3/leaf-ui';

const demoRequest = ({ signal, onProgress }: UploadRequest) =>
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
      percent += 12;
      onProgress(percent);
      if (percent >= 100) {
        cleanup();
        resolve();
      }
    }, 180);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
export function UploadDrag() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <p className="leaf-demo-note">
        此示例在本地模拟上传进度，使用 action 或 customRequest 接入实际上传服务。
      </p>
      <Upload
        drag
        multiple
        accept="image/*"
        maxCount={4}
        customRequest={demoRequest}
        hint="仅限图片 · 支持取消与重试"
      />
    </div>
  );
}
