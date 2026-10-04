import { withBase } from '@rspress/core/runtime';
import { ImageCropper } from '@sudden3/leaf-ui';

export function ImageCropperAvatar() {
  return (
    <ImageCropper
      src={withBase('/media/landscape-2.svg')}
      shape="round"
      aspect={1}
      maxZoom={5}
      rotation={false}
      onExport={(result) => {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'avatar.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
    />
  );
}
