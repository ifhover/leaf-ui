import { Upload } from '@ifhover/leaf-ui';

export function UploadRestrictions() {
  return (
    <Upload
      multiple
      accept="image/*,.pdf,.txt"
      maxCount={5}
      maxSize={5 * 1024 * 1024}
      hint="Images, PDF or text; up to 5 files, 5 MB each"
    />
  );
}
