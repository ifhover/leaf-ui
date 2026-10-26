import { Upload } from '@ifhover/leaf-ui';

export function PictureCard() {
  return (
    <Upload accept="image/*" listType="picture-card" multiple>
      Choose images
    </Upload>
  );
}
