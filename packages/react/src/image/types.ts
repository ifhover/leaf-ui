export interface ImagePreviewItem {
  src: string;
  thumbnailSrc?: string;
  alt?: string;
  width?: number;
  height?: number;
  download?: string | boolean;
  downloadName?: string;
}

export interface ImagePreviewOptions {
  index?: number;
  onIndexChange?: (index: number) => void;
  thumbnails?: boolean;
  downloadable?: boolean;
  onClose?: () => void;
}

/** Internal renderer contract, not a declarative public component. */
export interface ImageViewerProps extends Omit<ImagePreviewOptions, 'onClose'> {
  items: readonly ImagePreviewItem[];
  open: boolean;
  onClose: () => void;
  onHidden?: () => void;
  session?: symbol;
}
