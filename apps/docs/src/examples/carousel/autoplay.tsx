import { Button, Card, Carousel, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const slides = [
  { key: 'plan', label: '计划' },
  { key: 'create', label: '创作' },
  { key: 'share', label: '分享' },
];

export function CarouselAutoplay() {
  const [enabled, setEnabled] = useState(true);
  return (
    <Flex direction="column" gap="md">
      <Carousel autoplay={enabled ? 3000 : false} aria-label="自动播放的项目阶段">
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
          {enabled ? '停止自动播放' : '开始自动播放'}
        </Button>
      </Flex>
    </Flex>
  );
}
