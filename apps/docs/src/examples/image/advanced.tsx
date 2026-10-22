import { Flex, Image, ImagePreviewGroup } from '@ifhover/leaf-ui';

const landscape = (background: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><circle cx="480" cy="180" r="72" fill="#fff" opacity=".5"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242" opacity=".55"/></svg>`,
  )}`;
const landscapes = ['#b9d3bf', '#dae2eb', '#e1d9ca'].map((fill) => landscape(fill));

export function ImageGallery() {
  return (
    <ImagePreviewGroup thumbnails downloadable>
      <Flex gap="md" align="center" wrap justify="center">
        {landscapes.map((src, index) => (
          <Image key={src} src={src} width={180} height={120} alt={`风景 ${index + 1}`} />
        ))}
      </Flex>
    </ImagePreviewGroup>
  );
}
