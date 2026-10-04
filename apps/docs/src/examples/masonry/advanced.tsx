import { withBase } from '@rspress/core/runtime';
import { Image, Masonry } from '@sudden3/leaf-ui';

export function MasonryImages() {
  return (
    <Masonry columns={{ xs: 1, sm: 2 }}>
      {[1, 2, 3].map((index) => (
        <Image
          key={index}
          src={withBase(`/media/landscape-${index}.svg`)}
          alt={`风景 ${index}`}
          width="100%"
          height={index === 2 ? 220 : 150}
        />
      ))}
    </Masonry>
  );
}
