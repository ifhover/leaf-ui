import { Button, useImagePreview } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

const image = {
  src: withBase('/media/landscape-1.svg'),
  alt: 'Green valley',
  width: 960,
  height: 640,
};

export function ImageBasic() {
  const { preview } = useImagePreview();
  return <Button onClick={() => preview(image)}>Preview image</Button>;
}
