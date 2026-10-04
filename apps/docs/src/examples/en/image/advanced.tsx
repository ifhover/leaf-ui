import { withBase } from '@rspress/core/runtime';
import { Image, ImagePreviewGroup } from '@sudden3/leaf-ui';

export function ImageGallery() {
  return (
    <ImagePreviewGroup thumbnails downloadable>
      <div className="leaf-demo-row">
        {[1, 2, 3].map((index) => (
          <Image
            key={index}
            src={withBase(`/media/landscape-${index}.svg`)}
            width={180}
            height={120}
            alt={`Landscape ${index}`}
          />
        ))}
      </div>
    </ImagePreviewGroup>
  );
}
