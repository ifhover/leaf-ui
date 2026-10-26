import { Upload } from '@ifhover/leaf-ui';

export function UploadRestrictions() {
  return (
    <Upload
      multiple
      accept="image/*,.pdf,.txt"
      maxCount={5}
      maxSize={5 * 1024 * 1024}
      hint="图片、PDF 或文本；最多 5 个，每个不超过 5 MB"
    />
  );
}
