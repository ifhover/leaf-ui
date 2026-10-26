import { Button, Flex, Image, ImagePreviewGroup, useImagePreview } from '@ifhover/leaf-ui';

const source = (index: number, width = 1800, height = 1200) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${index % 2 ? '#91b9a5' : '#adc4db'}"/><text x="50%" y="50%" font-size="160" text-anchor="middle">${index + 1}</text></svg>`)}`;
const images = Array.from({ length: 20 }, (_, index) => ({
  src: source(index),
  alt: `Landscape ${index + 1}`,
}));

export function ImageFixture() {
  const { preview } = useImagePreview();
  return (
    <Flex direction="column" gap="lg">
      <Flex gap="md" wrap>
        {[160, 96, 40].map((size) => (
          <Image key={size} width={size} height={size} alt={`Empty ${size}`} />
        ))}
        <Image src="data:image/png;base64,invalid" width={160} height={104} alt="Failed" />
        <Image src="data:image/png;base64,invalid" width={40} height={40} alt="Small failed" />
      </Flex>
      <ImagePreviewGroup items={images}>
        <Image src={images[0]?.src} width={180} height={120} alt="Open gallery" />
      </ImagePreviewGroup>
      <Button onClick={() => preview(images, { index: 1 })}>Preview gallery</Button>
      <Button onClick={() => preview(source(0, 80, 60))}>Preview small image</Button>
    </Flex>
  );
}
