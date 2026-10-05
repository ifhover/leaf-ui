import { Upload } from '@sudden3/leaf-ui';
export function UploadBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Upload
        multiple
        accept="image/*,.pdf,.txt"
        maxCount={5}
        maxSize={5 * 1024 * 1024}
        hint="Images, PDF or text · up to 5 files, 5 MB each"
      />
    </div>
  );
}
