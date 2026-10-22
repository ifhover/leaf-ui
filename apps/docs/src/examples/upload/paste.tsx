import { Upload } from '@ifhover/leaf-ui';

export function Paste({ english = false }) {
  return (
    <Upload
      customRequest={async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {};
      }}
      paste
    >
      {english ? 'Paste an image to upload' : '粘贴图片即可上传'}
    </Upload>
  );
}
