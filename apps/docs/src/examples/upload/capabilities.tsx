import { Button, Space, Upload, type UploadHandle } from '@sudden3/leaf-ui';
import { useRef } from 'react';
export function Capabilities({ english = false }) {
  const upload = useRef<UploadHandle>(null);
  return (
    <Space direction="vertical" align="stretch">
      <Upload
        ref={upload}
        autoUpload={false}
        concurrency={2}
        multiple
        accept="image/*"
        listType="picture-card"
        paste
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
        <Button variant="outline" onClick={() => upload.current?.abort()}>
          {english ? 'Cancel uploads' : '取消上传'}
        </Button>
      </Space>
    </Space>
  );
}
