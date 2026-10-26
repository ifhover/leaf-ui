import { Button, useImagePreview } from '@ifhover/leaf-ui';

const items = ['#b9d3bf', '#dae2eb', '#e1d9ca'].map((background, index) => ({
  src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242"/></svg>`,
  )}`,
  alt: `风景 ${index + 1}`,
}));

export function ImageService() {
  const { preview } = useImagePreview();

  return <Button onClick={() => preview(items, { index: 1 })}>从第二张开始预览</Button>;
}
