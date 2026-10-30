import { Button, useImagePreview } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

const items = [1, 2, 3].map((number) => ({
  src: withBase(`/media/landscape-${number}.svg`),
  width: 960,
  height: 640,
  alt: `风景 ${number}`,
}));

export function ImageService() {
  const { preview } = useImagePreview();

  return (
    <Button onClick={() => preview(items, { index: 1, downloadable: true })}>
      从第二张开始预览
    </Button>
  );
}
