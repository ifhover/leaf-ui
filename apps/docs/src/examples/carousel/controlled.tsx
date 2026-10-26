import { Button, Card, Carousel, type CarouselHandle, Flex, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const slides = [
  { key: 'plan', label: '计划' },
  { key: 'create', label: '创作' },
  { key: 'share', label: '分享' },
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
        aria-label="外部控制的项目阶段"
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
        <Button onClick={() => carousel.current?.previous()}>上一项</Button>
        <Button onClick={() => carousel.current?.next()}>下一项</Button>
        <Button onClick={() => carousel.current?.goTo(0)}>回到第一项</Button>
      </Flex>
      <Text role="status" tone="muted">
        当前：{index + 1} / {slides.length}
      </Text>
    </Flex>
  );
}
