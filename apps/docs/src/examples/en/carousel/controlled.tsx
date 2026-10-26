import { Button, Card, Carousel, type CarouselHandle, Flex, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const slides = [
  { key: 'plan', label: 'Plan' },
  { key: 'create', label: 'Create' },
  { key: 'share', label: 'Share' },
];

export function CarouselControlled() {
  const carousel = useRef<CarouselHandle>(null);
  const [index, setIndex] = useState(0);
  return (
    <Flex direction="column" gap="md">
      <Carousel
        ref={carousel}
        activeIndex={index}
        onChange={setIndex}
        arrows={false}
        aria-label="Externally controlled project stages"
      >
        {slides.map((slide) => (
          <Card key={slide.key}>
            <Flex align="center" justify="center" style={{ minHeight: 144 }}>
              <Text>{slide.label}</Text>
            </Flex>
          </Card>
        ))}
      </Carousel>
      <Flex gap="sm" wrap>
        <Button onClick={() => carousel.current?.previous()}>Previous</Button>
        <Button onClick={() => carousel.current?.next()}>Next</Button>
        <Button onClick={() => carousel.current?.goTo(0)}>Go to first</Button>
      </Flex>
      <Text role="status" tone="muted">
        Current: {index + 1} / {slides.length}
      </Text>
    </Flex>
  );
}
