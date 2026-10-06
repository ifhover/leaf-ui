import { UserRound } from 'lucide-react';
import {
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  srcSet?: string;
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'alt' | 'onError'>;
  alt?: string;
  size?: ControlSize | number;
  shape?: 'circle' | 'square';
  icon?: ReactNode;
  onError?: () => void;
}
export function Avatar({
  src,
  srcSet,
  imageProps,
  alt,
  size = 'md',
  shape = 'circle',
  icon,
  onError,
  children,
  className,
  style,
  ...props
}: AvatarProps) {
  const { messages } = useLeafConfig();
  const image = useRef<HTMLImageElement>(null);
  const [failedSource, setFailedSource] = useState<string>();
  const [loadedSource, setLoadedSource] = useState<string>();
  const source = `${src ?? ''}|${srcSet ?? ''}`;
  const imageVisible = Boolean(src || srcSet) && failedSource !== source;
  useEffect(() => {
    if (imageVisible && image.current?.complete && image.current.naturalWidth > 0)
      setLoadedSource(source);
  }, [imageVisible, source]);
  return (
    <span
      {...props}
      role="img"
      aria-label={
        alt ?? props['aria-label'] ?? (typeof children === 'string' ? children : messages.avatar)
      }
      className={classes(
        'leaf-avatar',
        `leaf-avatar--${shape}`,
        typeof size === 'string' && `leaf-avatar--${size}`,
        className,
      )}
      data-loaded={imageVisible && loadedSource === source ? '' : undefined}
      style={{
        ...(typeof size === 'number'
          ? {
              width: Math.max(1, size),
              height: Math.max(1, size),
              fontSize: Math.max(12, size * 0.4),
            }
          : {}),
        ...style,
      }}
    >
      <span className="leaf-avatar__fallback" aria-hidden="true">
        {children ?? icon ?? <UserRound />}
      </span>
      {imageVisible && (
        <img
          {...imageProps}
          ref={image}
          src={src}
          srcSet={srcSet}
          alt=""
          onLoad={(event) => {
            setLoadedSource(source);
            imageProps?.onLoad?.(event);
          }}
          onError={() => {
            setFailedSource(source);
            onError?.();
          }}
        />
      )}
    </span>
  );
}
