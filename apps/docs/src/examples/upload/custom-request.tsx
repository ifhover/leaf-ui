import { Upload } from '@ifhover/leaf-ui';

export function CustomRequest({ english = false }) {
  return (
    <Upload
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
      multiple
    >
      {english ? 'Upload with your own request' : '使用自定义请求上传'}
    </Upload>
  );
}
