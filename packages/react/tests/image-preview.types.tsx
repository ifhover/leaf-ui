import type {
  ImagePreviewApi,
  ImagePreviewItem,
  ImagePreviewOptions,
  LeafComponentDefaults,
} from '../src';
import type { ImagePreviewApi as SubpathApi } from '../src/image';

type RemovedName = 'Image' | 'ImagePreview' | 'ImagePreviewGroup';
type RemovedExports = Extract<
  keyof typeof import('../src') | keyof typeof import('../src/image'),
  RemovedName
>;
export const onlyImperativeImageExports: [RemovedExports] extends [never] ? true : never = true;

export function imagePreviewTypeContracts(api: ImagePreviewApi) {
  const subpath: SubpathApi = api;
  const item: ImagePreviewItem = { src: '/image.png', alt: 'Landscape' };
  const options: ImagePreviewOptions = { index: 0, thumbnails: true, downloadable: true };
  const close: () => void = subpath.preview([item, '/other.png'], options);
  const defaults: LeafComponentDefaults = { ImagePreview: { thumbnails: false } };
  // @ts-expect-error Inline image rendering is owned by native img elements.
  const removedImage: LeafComponentDefaults = { Image: {} };
  // @ts-expect-error Declarative preview groups are no longer public.
  const removedGroup: LeafComponentDefaults = { ImagePreviewGroup: {} };
  // @ts-expect-error Closing callbacks belong to individual preview requests.
  const requestOnly: LeafComponentDefaults = { ImagePreview: { onClose: () => {} } };
  return { close, defaults, removedImage, removedGroup, requestOnly };
}
