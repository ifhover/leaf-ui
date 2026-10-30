import { Button, useImagePreview } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

const items = [1, 2, 3].map((number) => ({
  src: withBase(`/media/landscape-${number}.svg`),
  width: 960,
  height: 640,
  alt: `Landscape ${number}`,
}));

export function ImageService() {
  const { preview } = useImagePreview();

  return (
    <Button onClick={() => preview(items, { index: 1, downloadable: true })}>
      Start with the second image
    </Button>
  );
}
