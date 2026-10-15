import {
  Check,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  File,
  FileArchive,
  FileAudio2,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo2,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { ImagePreviewControl as ImagePreview } from '../image/image';
import { ModalBase } from '../modal/modal';
import { classes } from '../shared/classes';
import { useListMotion } from '../shared/motion';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import { fileExtension, fileKind, fileName, formatFileSize, safeFileUrl } from './model';

export interface FileItem {
  uid?: string;
  url?: string;
  name?: string;
  size?: number;
  type?: string;
  status?: 'ready' | 'uploading' | 'done' | 'error' | 'cancelled';
  percent?: number;
  error?: string;
  originFile?: globalThis.File;
}
export interface FileListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  items: readonly FileItem[];
  downloadable?: boolean;
  previewable?: boolean;
  removable?: boolean;
  onPreview?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onRemove?: (file: FileItem) => void | boolean | Promise<void> | Promise<boolean>;
  renderActions?: (file: FileItem, actions: ReactNode) => ReactNode;
  emptyContent?: ReactNode;
  disabled?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
}
const icons = {
  image: FileImage,
  video: FileVideo2,
  audio: FileAudio2,
  document: FileText,
  sheet: FileSpreadsheet,
  archive: FileArchive,
  code: FileCode2,
  file: File,
};

function FileVisual({ file, listType }: { file: FileItem; listType: FileListProps['listType'] }) {
  const kind = fileKind(file);
  const Icon = icons[kind];
  const url = safeFileUrl(file.url);
  const [failedUrl, setFailedUrl] = useState<string>();
  const thumbnail = Boolean(listType !== 'text' && kind === 'image' && url && failedUrl !== url);
  return (
    <span
      className="leaf-file-list__icon"
      data-kind={kind}
      data-extension={fileExtension(file)}
      data-thumbnail={thumbnail || undefined}
      aria-hidden="true"
    >
      <Icon size={22} />
      {thumbnail && (
        <img src={url} alt="" loading="lazy" decoding="async" onError={() => setFailedUrl(url)} />
      )}
    </span>
  );
}

interface FileRowProps
  extends Pick<
    FileListProps,
    'downloadable' | 'previewable' | 'removable' | 'onDownload' | 'onRemove' | 'renderActions'
  > {
  file: FileItem;
  motionKey: string;
  disabled: boolean;
  listType: FileListProps['listType'];
  onPreview: (file: FileItem) => void;
}
function FileRow({
  file,
  motionKey,
  disabled,
  listType,
  downloadable,
  previewable,
  removable,
  onDownload,
  onRemove,
  onPreview,
  renderActions,
}: FileRowProps) {
  const t = useText();
  const format = useFormattedText();
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const name = fileName(file);
  const kind = fileKind(file);
  const url = safeFileUrl(file.url);
  const extension = fileExtension(file).toUpperCase();
  const size = file.size ?? file.originFile?.size;
  const formattedSize = size === undefined ? '' : formatFileSize(size);
  const percent = Number.isFinite(file.percent) ? Math.max(0, Math.min(100, file.percent ?? 0)) : 0;
  const canPreview = previewable && url && ['image', 'video', 'audio'].includes(kind);
  const status =
    file.status === 'uploading' ? (
      <>
        {t('fileList.uploading')} <span>{Math.round(percent)}%</span>
      </>
    ) : file.status === 'done' ? (
      <>
        <Check size={13} aria-hidden="true" />
        {t('fileList.uploadComplete')}
      </>
    ) : file.status === 'error' ? (
      <>
        <CircleAlert size={13} aria-hidden="true" />
        {t('fileList.uploadFailed')}
      </>
    ) : file.status === 'cancelled' ? (
      t('fileList.cancelled')
    ) : file.status === 'ready' ? (
      <>
        <Clock3 size={13} aria-hidden="true" />
        {t('fileList.ready')}
      </>
    ) : null;
  const actions = (
    <>
      {canPreview && (
        <ButtonControl
          className="leaf-file-list__action"
          variant="ghost"
          size="sm"
          disabled={disabled}
          startIcon={<Eye size={16} />}
          aria-label={format('fileList.preview', { name })}
          title={t('common.preview')}
          onClick={() => onPreview(file)}
        />
      )}
      {downloadable &&
        url &&
        (onDownload ? (
          <ButtonControl
            className="leaf-file-list__action"
            variant="ghost"
            size="sm"
            disabled={disabled}
            startIcon={<Download size={16} />}
            aria-label={format('fileList.download', { name })}
            title={t('common.download')}
            onClick={() => onDownload(file)}
          />
        ) : (
          <a
            className="leaf-file-list__action"
            href={disabled ? undefined : url}
            download={name}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={format('fileList.download', { name })}
            title={t('common.download')}
            aria-disabled={disabled || undefined}
            role={disabled ? 'link' : undefined}
            tabIndex={disabled ? -1 : undefined}
          >
            <Download size={16} aria-hidden="true" />
          </a>
        ))}
      {removable && onRemove && (
        <ButtonControl
          className="leaf-file-list__action leaf-file-list__remove"
          variant="ghost"
          size="sm"
          disabled={disabled}
          loading={removing}
          startIcon={<Trash2 size={16} />}
          aria-label={format('fileList.remove', { name })}
          title={t('common.remove')}
          onClick={async () => {
            if (pending.current) return;
            pending.current = true;
            setRemoving(true);
            setRemoveError('');
            try {
              await onRemove(file);
            } catch (reason) {
              if (mounted.current)
                setRemoveError(reason instanceof Error ? reason.message : String(reason));
            } finally {
              pending.current = false;
              if (mounted.current) setRemoving(false);
            }
          }}
        />
      )}
    </>
  );
  const renderedActions = renderActions ? renderActions(file, actions) : actions;
  return (
    <li
      className="leaf-file-list__item"
      data-status={file.status}
      data-motion-key={motionKey}
      aria-busy={file.status === 'uploading' || removing || undefined}
    >
      <FileVisual file={file} listType={listType} />
      <div className="leaf-file-list__details">
        <span className="leaf-file-list__name" title={name}>
          {name}
        </span>
        <div className="leaf-file-list__meta">
          <span className="leaf-file-list__type">{extension || t('fileList.fileType')}</span>
          {formattedSize && <span className="leaf-file-list__size">{formattedSize}</span>}
        </div>
      </div>
      {status && (
        <span className="leaf-file-list__status" data-status={file.status}>
          {status}
        </span>
      )}
      {file.status === 'uploading' && (
        <div
          className="leaf-file-list__progress"
          role="progressbar"
          aria-label={format('fileList.uploadProgress', { name })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      )}
      {(removeError || (file.status === 'error' && file.error)) && (
        <p className="leaf-file-list__error" role={removeError ? 'alert' : undefined}>
          {removeError || file.error}
        </p>
      )}
      {renderedActions !== null && renderedActions !== false && (
        <div className="leaf-file-list__actions">{renderedActions}</div>
      )}
    </li>
  );
}

export function FileListControl({
  items,
  downloadable = true,
  previewable = true,
  removable = false,
  onPreview,
  onDownload,
  onRemove,
  renderActions,
  emptyContent,
  disabled = false,
  listType = 'text',
  className,
  ...props
}: FileListProps) {
  const t = useText();
  const root = useRef<HTMLDivElement>(null);
  const occurrences = new Map<string, number>();
  const keys = items.map((file) => {
    const identity = file.uid ?? file.url ?? fileName(file);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return JSON.stringify([identity, occurrence]);
  });
  useListMotion(root, JSON.stringify(keys), '.leaf-file-list__item[data-motion-key]', listType);
  const [preview, setPreview] = useState<FileItem | null>(null);
  const selected = preview
    ? items.find((file) =>
        preview.uid
          ? file.uid === preview.uid
          : preview.url
            ? file.url === preview.url
            : file === preview,
      )
    : undefined;
  const images = items.filter((file) => fileKind(file) === 'image' && safeFileUrl(file.url));
  const kind = selected ? fileKind(selected) : undefined;
  const previewUrl = safeFileUrl(selected?.url);
  const index = selected ? images.indexOf(selected) : -1;
  return (
    <div
      {...props}
      ref={root}
      className={classes('leaf-file-list', `leaf-file-list--${listType}`, className)}
      data-disabled={disabled || undefined}
    >
      {items.length ? (
        <ul className="leaf-file-list__items">
          {items.map((file, position) => (
            <FileRow
              key={keys[position]}
              motionKey={keys[position] ?? String(position)}
              file={file}
              listType={listType}
              disabled={disabled}
              downloadable={downloadable}
              previewable={previewable}
              removable={removable}
              onDownload={onDownload}
              onRemove={onRemove}
              renderActions={renderActions}
              onPreview={(file) => (onPreview ? onPreview(file) : setPreview(file))}
            />
          ))}
        </ul>
      ) : (
        <div className="leaf-file-list__empty">
          {emptyContent ?? (
            <>
              <Paperclip size={22} aria-hidden="true" />
              <span>{t('fileList.noFiles')}</span>
            </>
          )}
        </div>
      )}
      <ImagePreview
        items={images.map((file) => ({
          src: safeFileUrl(file.url) ?? '',
          alt: fileName(file),
          downloadName: fileName(file),
        }))}
        open={Boolean(previewUrl && kind === 'image' && index >= 0)}
        index={Math.max(0, index)}
        onIndexChange={(next) => setPreview(images[next] ?? null)}
        onClose={() => setPreview(null)}
        downloadable={downloadable && !disabled}
      />
      <ModalBase
        open={Boolean(previewUrl && (kind === 'video' || kind === 'audio'))}
        title={selected ? fileName(selected) : ''}
        footer={null}
        width={kind === 'audio' ? 520 : 800}
        onClose={() => setPreview(null)}
        className="leaf-file-list__media-modal"
      >
        {previewUrl && kind === 'video' && (
          <video
            key={previewUrl}
            controls
            preload="metadata"
            src={previewUrl}
            aria-label={selected ? fileName(selected) : ''}
          >
            <track kind="captions" />
          </video>
        )}
        {previewUrl && kind === 'audio' && (
          <audio
            key={previewUrl}
            controls
            preload="metadata"
            src={previewUrl}
            aria-label={selected ? fileName(selected) : ''}
          >
            <track kind="captions" />
          </audio>
        )}
      </ModalBase>
    </div>
  );
}

export function FileList(rawProps: FileListProps) {
  const props = useComponentProps('FileList', rawProps);
  return <FileListControl {...props} />;
}
