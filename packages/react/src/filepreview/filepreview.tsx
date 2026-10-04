import { Download, FileQuestion } from 'lucide-react';
import { type HTMLAttributes, lazy, type ReactNode, Suspense, useEffect, useState } from 'react';
import { Image } from '../image';
import { Loading } from '../loading';
import { Result } from '../result';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
export interface FilePreviewSource {
  url: string;
  name?: string;
  contentType?: string;
}
export interface FilePreviewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  file: FilePreviewSource | File;
  height?: number | string;
  downloadable?: boolean;
  workerSrc?: string;
  maxTextBytes?: number;
  onError?: (error: Error) => void;
  renderUnsupported?: (source: FilePreviewSource) => ReactNode;
}
const PDF = lazy(() => import('./pdf-viewer').then((module) => ({ default: module.PdfViewer })));
const Text = lazy(() => import('./text-viewer').then((module) => ({ default: module.TextViewer })));
export function fileKind(
  name: string,
  contentType = '',
): 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'unsupported' {
  const extension = name.split(/[?#]/)[0]?.split('.').pop()?.toLowerCase();
  if (
    contentType.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'bmp', 'svg'].includes(extension ?? '')
  )
    return 'image';
  if (contentType.startsWith('video/') || ['mp4', 'webm', 'mov', 'ogv'].includes(extension ?? ''))
    return 'video';
  if (
    contentType.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension ?? '')
  )
    return 'audio';
  if (contentType === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (
    contentType.startsWith('text/') ||
    [
      'txt',
      'md',
      'csv',
      'json',
      'log',
      'ts',
      'tsx',
      'js',
      'jsx',
      'scss',
      'css',
      'html',
      'xml',
      'yml',
      'yaml',
    ].includes(extension ?? '')
  )
    return 'text';
  return 'unsupported';
}
export function FilePreview({
  file,
  height = 460,
  downloadable = true,
  workerSrc,
  maxTextBytes = 1024 * 1024,
  onError,
  renderUnsupported,
  className,
  style,
  ...props
}: FilePreviewProps) {
  const t = useText();
  const [local, setLocal] = useState<FilePreviewSource | null>(null);
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
    if ('url' in file) {
      setLocal(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocal({ url, name: file.name, contentType: file.type });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const source = 'url' in file ? file : local;
  const name = source?.name ?? source?.url.split('/').pop() ?? t('文件', 'File');
  const kind = fileKind(name, source?.contentType);
  const unsafe = source && /^(?:javascript|vbscript):/i.test(source.url.trim());
  const failure = (reason: unknown) =>
    onError?.(reason instanceof Error ? reason : new Error(String(reason)));
  let content: ReactNode = <Loading />;
  if (unsafe)
    content = <Result status="error" title={t('无法预览此链接', 'This URL cannot be previewed')} />;
  else if (source) {
    if (kind === 'image')
      content = (
        <Image
          src={source.url}
          alt={name}
          fit="contain"
          width="100%"
          height="100%"
          onError={failure}
        />
      );
    else if (kind === 'video')
      content = (
        <video
          controls
          preload="metadata"
          src={source.url}
          aria-label={name}
          onError={() => failure(new Error('Video cannot be played.'))}
        >
          <track kind="captions" />
        </video>
      );
    else if (kind === 'audio')
      content = (
        <audio
          controls
          preload="metadata"
          src={source.url}
          aria-label={name}
          onError={() => failure(new Error('Audio cannot be played.'))}
        >
          <track kind="captions" />
        </audio>
      );
    else if (kind === 'pdf')
      content = client ? (
        <Suspense fallback={<Loading />}>
          <PDF url={source.url} workerSrc={workerSrc} onError={failure} />
        </Suspense>
      ) : (
        <Loading />
      );
    else if (kind === 'text')
      content = client ? (
        <Suspense fallback={<Loading />}>
          <Text url={source.url} maxBytes={maxTextBytes} name={name} onError={failure} />
        </Suspense>
      ) : (
        <Loading />
      );
    else
      content = renderUnsupported?.(source) ?? (
        <Result
          status="info"
          icon={<FileQuestion size={40} />}
          title={t('此格式暂不支持在线预览', 'Online preview is not available for this format')}
          description={name}
        />
      );
  }
  return (
    <div {...props} className={classes('leaf-file-preview', className)} style={style}>
      <div className="leaf-file-preview__header">
        <span>{name}</span>
        {source && !unsafe && downloadable && (
          <a
            href={source.url}
            download={name}
            target="_blank"
            rel="noopener noreferrer"
            className="leaf-file-preview__download"
          >
            <Download size={15} aria-hidden="true" />
            {t('下载', 'Download')}
          </a>
        )}
      </div>
      <div className="leaf-file-preview__content" style={{ height }}>
        {content}
      </div>
    </div>
  );
}
