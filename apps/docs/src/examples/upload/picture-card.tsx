import { Upload } from '@ifhover/leaf-ui';

export function PictureCard() {
  return (
    <Upload accept="image/*" listType="picture-card" multiple>
      选择图片
    </Upload>
  );
}
