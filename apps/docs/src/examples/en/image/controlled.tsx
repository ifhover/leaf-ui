import { Button, Flex, ImagePreview, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items = ['#b9d3bf', '#dae2eb', '#e1d9ca'].map((background, index) => ({
  src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242"/></svg>`,
  )}`,
  alt: `Landscape ${index + 1}`,
}));

export function ImageControlled() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <Flex direction="column" gap="md">
      <Flex gap="md" wrap>
        <Button onClick={() => setOpen(true)}>Open current image</Button>
        <Button onClick={() => setIndex(0)}>Reset to first image</Button>
      </Flex>
      <Text tone="muted" role="status">
        Image: {index + 1} / {items.length}
      </Text>
      <ImagePreview
        items={items}
        open={open}
        index={index}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
      />
    </Flex>
  );
}
