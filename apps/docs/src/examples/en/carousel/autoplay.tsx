import { Button, Card, Carousel, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const slides = [
  { key: 'plan', label: 'Plan' },
  { key: 'create', label: 'Create' },
  { key: 'share', label: 'Share' },
];

export function CarouselAutoplay() {
  const [enabled, setEnabled] = useState(true);
  return (
    <Flex direction="column" gap="md">
      <Carousel autoplay={enabled ? 3000 : false} aria-label="Autoplay project stages">
        {slides.map((slide) => (
          <Card key={slide.key}>
            <Flex align="center" justify="center" style={{ minHeight: 144 }}>
              <Text>{slide.label}</Text>
            </Flex>
          </Card>
        ))}
      </Carousel>
      <Flex>
        <Button onClick={() => setEnabled((value) => !value)}>
          {enabled ? 'Stop autoplay' : 'Start autoplay'}
        </Button>
      </Flex>
    </Flex>
  );
}
