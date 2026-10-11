import { ImageCropper } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function ImageCropperAvatar() {
  return (
    <ImageCropper
      src={withBase('/media/landscape-2.svg')}
      shape="round"
      aspect={1}
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
