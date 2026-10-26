import { Card, Carousel, Flex, Text } from '@ifhover/leaf-ui';

const slides = [
  { key: 'plan', label: '计划' },
  { key: 'create', label: '创作' },
  { key: 'share', label: '分享' },
];

export function CarouselBasic() {
  return (
    <Carousel aria-label="项目阶段">
      {slides.map((slide) => (
        <Card key={slide.key}>
          <Flex align="center" justify="center" style={{ minHeight: 144 }}>
            <Text>{slide.label}</Text>
          </Flex>
        </Card>
      ))}
    </Carousel>
  );
}
