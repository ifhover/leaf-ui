import { Button, Space, Upload, type UploadHandle } from '@ifhover/leaf-ui';
import { useRef } from 'react';

export function ManualUpload({ english = false }) {
  const upload = useRef<UploadHandle>(null);
  return (
    <Space direction="vertical" align="stretch">
      <Upload
        autoUpload={false}
        ref={upload}
        customRequest={async (request) => {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, 700);
            request.signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timer);
                reject(request.signal.reason);
              },
              { once: true },
            );
          });
          return {};
        }}
      />
      <Space>
        <Button onClick={() => upload.current?.upload()}>
          {english ? 'Start upload' : '开始上传'}
        </Button>
        <Button onClick={() => upload.current?.abort()} variant="outline">
          {english ? 'Cancel uploads' : '取消上传'}
        </Button>
      </Space>
    </Space>
  );
}
