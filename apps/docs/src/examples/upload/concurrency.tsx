import { Upload } from '@ifhover/leaf-ui';

export function Concurrency({ english = false }) {
  return (
    <Upload
      concurrency={2}
      customRequest={async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {};
      }}
      multiple
    >
      {english ? 'Upload files (two at a time)' : '上传文件（同时两个）'}
    </Upload>
  );
}
