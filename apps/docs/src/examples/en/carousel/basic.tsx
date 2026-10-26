import { Card, Carousel, Flex, Text } from '@ifhover/leaf-ui';

const slides = [
  { key: 'plan', label: 'Plan' },
  { key: 'create', label: 'Create' },
  { key: 'share', label: 'Share' },
];

export function CarouselBasic() {
  return (
    <Carousel aria-label="Project stages">
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
