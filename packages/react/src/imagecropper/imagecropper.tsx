import {
  forwardRef,
  type HTMLAttributes,
  lazy,
  type ReactNode,
  Suspense,
  useImperativeHandle,
  useRef,
} from 'react';
import { Loading } from '../loading';
import { classes } from '../shared/classes';
import { useClient } from '../shared/use-client';
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ImageCropResult {
  blob: Blob;
  width: number;
  height: number;
}
export interface ImageCropperHandle {
  export: () => Promise<ImageCropResult>;
  reset: () => void;
}
export interface ImageCropperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError'> {
  src: string;
  aspect?: number;
  shape?: 'rect' | 'round';
  minWidth?: number;
  minHeight?: number;
  disabled?: boolean;
  showGrid?: boolean;
  showActions?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
  onChange?: (area: CropArea) => void;
  onExport?: (result: ImageCropResult) => void;
  onError?: (error: Error) => void;
  extra?: ReactNode;
}
const Editor = lazy(() => import('./editor').then((module) => ({ default: module.CropEditor })));
export const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(
  function ImageCropper(props, ref) {
    const editor = useRef<ImageCropperHandle>(null);
    const client = useClient();
    useImperativeHandle(
      ref,
      () => ({
        export: () =>
          editor.current?.export() ?? Promise.reject(new Error('Image cropper is loading.')),
        reset: () => editor.current?.reset(),
      }),
      [],
    );
    return (
      <div className={classes('leaf-image-cropper', props.className)} style={props.style}>
        {client ? (
          <Suspense
            fallback={
              <div className="leaf-image-cropper__stage">
                <Loading />
              </div>
            }
          >
            <Editor
              key={`${props.src}-${props.crossOrigin ?? 'anonymous'}`}
              {...props}
              ref={editor}
            />
          </Suspense>
        ) : (
          <div className="leaf-image-cropper__stage">
            <Loading />
          </div>
        )}
      </div>
    );
  },
);
