import { Upload } from '@ifhover/leaf-ui';

export function PictureCard({ english = false }) {
  return (
    <Upload
      accept="image/*"
      customRequest={async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {};
      }}
      listType="picture-card"
      multiple
    >
      {english ? 'Upload images' : '上传图片'}
    </Upload>
  );
}
