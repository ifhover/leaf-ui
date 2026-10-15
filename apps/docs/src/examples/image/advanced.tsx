import { Flex, Image, ImagePreviewGroup } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function ImageGallery() {
  return (
    <ImagePreviewGroup thumbnails downloadable>
      <Flex gap="md" align="center" wrap justify="center">
        {[1, 2, 3].map((index) => (
          <Image
            key={index}
            src={withBase(`/media/landscape-${index}.svg`)}
            width={180}
            height={120}
            alt={`风景 ${index}`}
          />
        ))}
      </Flex>
    </ImagePreviewGroup>
  );
}
