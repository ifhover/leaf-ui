import { Upload } from '@sudden3/leaf-ui';
export function UploadBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Upload
        multiple
        accept="image/*,.pdf,.txt"
        maxCount={5}
        maxSize={5 * 1024 * 1024}
        hint="图片、PDF 或文本 · 最多 5 个文件，每个不超过 5 MB"
      />
    </div>
  );
}
