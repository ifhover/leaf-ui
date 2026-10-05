import {
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
  Trash2,
} from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useState } from 'react';
import { Button } from '../button';
import { ImagePreview } from '../image';
import { Modal } from '../modal';
import { classes } from '../shared/classes';
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
export function FileList({
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
  className,
  ...props
}: FileListProps) {
  const t = useText();
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState('');
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
    <div {...props} className={classes('leaf-file-list', className)}>
      {items.length ? (
        <ul className="leaf-file-list__items">
          {items.map((file, index) => {
            const key = file.uid ?? `${file.url ?? fileName(file)}-${index}`;
            const name = fileName(file);
            const kind = fileKind(file);
            const Icon = icons[kind];
            const url = safeFileUrl(file.url);
            const size = file.size ?? file.originFile?.size;
            const isPending = pending.includes(key);
            const canPreview = previewable && url && ['image', 'video', 'audio'].includes(kind);
            const actions = (
              <>
                {canPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    startIcon={<Eye size={16} />}
                    aria-label={`${t('预览', 'Preview')} ${name}`}
                    title={t('预览', 'Preview')}
                    onClick={() => (onPreview ? onPreview(file) : setPreview(file))}
                  />
                )}
                {downloadable &&
                  url &&
                  (onDownload ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      startIcon={<Download size={16} />}
                      aria-label={`${t('下载', 'Download')} ${name}`}
                      title={t('下载', 'Download')}
                      onClick={() => onDownload(file)}
                    />
                  ) : (
                    <a
                      className="leaf-file-list__action"
                      href={disabled ? undefined : url}
                      download={name}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t('下载', 'Download')} ${name}`}
                      title={t('下载', 'Download')}
                      aria-disabled={disabled || undefined}
                      tabIndex={disabled ? -1 : undefined}
                    >
                      <Download size={16} aria-hidden="true" />
                    </a>
                  ))}
                {removable && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled || isPending}
                    loading={isPending}
                    startIcon={<Trash2 size={15} />}
                    aria-label={`${t('移除', 'Remove')} ${name}`}
                    title={t('移除', 'Remove')}
                    onClick={async () => {
                      if (isPending) return;
                      setPending((previous) => [...previous, key]);
                      setError('');
                      try {
                        await onRemove(file);
                      } catch (reason) {
                        setError(reason instanceof Error ? reason.message : String(reason));
                      } finally {
                        setPending((previous) => previous.filter((value) => value !== key));
                      }
                    }}
                  />
                )}
              </>
            );
            const percent = Math.max(0, Math.min(100, file.percent ?? 0));
            return (
              <li key={key} className="leaf-file-list__item" data-status={file.status}>
                <span
                  className="leaf-file-list__icon"
                  data-kind={kind}
                  data-extension={fileExtension(file)}
                >
                  <Icon size={21} aria-hidden="true" />
                </span>
                <div className="leaf-file-list__details">
                  <span className="leaf-file-list__name" title={name}>
                    {name}
                  </span>
                  <span className="leaf-file-list__meta">
                    {size !== undefined && formatFileSize(size) && (
                      <span>{formatFileSize(size)}</span>
                    )}
                    {file.status === 'uploading' && (
                      <span>
                        {t('上传中', 'Uploading')} {Math.round(percent)}%
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="leaf-file-list__error">
                        {file.error ?? t('上传失败', 'Upload failed')}
                      </span>
                    )}
                    {file.status === 'cancelled' && <span>{t('已取消', 'Cancelled')}</span>}
                    {file.status === 'ready' && <span>{t('待上传', 'Ready')}</span>}
                  </span>
                  {file.status === 'uploading' && (
                    <div
                      className="leaf-file-list__progress"
                      role="progressbar"
                      aria-label={`${t('上传进度', 'Upload progress')} ${name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(percent)}
                    >
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </div>
                <div className="leaf-file-list__actions">
                  {renderActions ? renderActions(file, actions) : actions}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="leaf-file-list__empty">{emptyContent ?? t('暂无文件', 'No files')}</div>
      )}
      {error && (
        <p role="alert" className="leaf-file-list__error">
          {error}
        </p>
      )}
      <ImagePreview
        items={images.map((file) => ({
          src: file.url ?? '',
          alt: fileName(file),
          downloadName: fileName(file),
        }))}
        open={Boolean(previewUrl && kind === 'image' && index >= 0)}
        index={Math.max(0, index)}
        onIndexChange={(next) => setPreview(images[next] ?? null)}
        onClose={() => setPreview(null)}
        downloadable={downloadable}
      />
      <Modal
        open={Boolean(previewUrl && (kind === 'video' || kind === 'audio'))}
        title={selected ? fileName(selected) : ''}
        footer={null}
        width={800}
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
      </Modal>
    </div>
  );
}
