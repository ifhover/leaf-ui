import { Carousel } from '@ifhover/leaf-ui';

const slides = [
  { key: 'plan', zh: '计划', en: 'Plan', color: '#edf6ee' },
  { key: 'create', zh: '创作', en: 'Create', color: '#eef3ff' },
  { key: 'share', zh: '分享', en: 'Share', color: '#fff5df' },
];
export function CarouselAutoplay({ english = false }: { english?: boolean }) {
  return (
    <Carousel autoplay={5000} arrows={false} aria-label={english ? 'Highlights' : '精选内容'}>
      {slides.map((slide) => (
        <div
          key={slide.key}
          style={{
            display: 'grid',
            placeItems: 'center',
            height: 150,
            background: slide.color,
            color: '#24372c',
          }}
        >
          {english ? slide.en : slide.zh}
        </div>
      ))}
    </Carousel>
  );
}
