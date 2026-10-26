import { Flex, Image, Text } from '@ifhover/leaf-ui';

const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="#b9d3bf"/><circle cx="480" cy="180" r="72" fill="#fff"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242"/></svg>',
)}`;

export function ImageFit() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Crop to fill (cover)</Text>
        <Image src={source} width="100%" height={160} alt="Cropped valley" fit="cover" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Fit entire image (contain)</Text>
        <Image src={source} width="100%" height={160} alt="Uncropped valley" fit="contain" />
      </Flex>
    </Flex>
  );
}
