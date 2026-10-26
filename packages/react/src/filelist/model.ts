import type { FileItem } from './filelist';

export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sheet'
  | 'archive'
  | 'code'
  | 'file';

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'avif',
  'bmp',
  'svg',
  'ico',
]);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogv', 'mov', 'm4v']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus']);
const DOCUMENT_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'rtf',
  'txt',
  'md',
  'mdx',
  'odt',
  'ppt',
  'pptx',
  'pages',
  'key',
  'epub',
]);
const SHEET_EXTENSIONS = new Set(['xls', 'xlsx', 'csv', 'tsv', 'ods', 'numbers']);
const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz']);
const CODE_EXTENSIONS = new Set([
  'js',
  'mjs',
  'cjs',
  'jsx',
  'ts',
  'mts',
  'cts',
  'tsx',
  'json',
  'html',
  'css',
  'scss',
  'less',
  'xml',
  'yml',
  'yaml',
  'toml',
  'sql',
  'sh',
  'py',
  'rb',
  'rs',
  'java',
  'go',
  'c',
  'cpp',
  'h',
  'cs',
  'php',
  'swift',
  'kt',
]);

const SAFE_DATA_MIME =
  /^data:(?:image\/(?:png|jpe?g|webp|gif|avif|bmp|x-icon|svg\+xml)|video\/(?:mp4|webm|ogg)|audio\/[a-z0-9.+-]+|application\/pdf|text\/(?:plain|csv|tab-separated-values|markdown))(?:;[a-z0-9=:+-]+)*,/i;

function isSafeSvgDataUrl(url: string): boolean {
  const comma = url.indexOf(',');
  if (comma < 0) return false;
  const header = url.slice(0, comma);
  const raw = url.slice(comma + 1);
  let decoded = raw;
  try {
    decoded = /;base64/i.test(header) ? atob(raw) : decodeURIComponent(raw);
  } catch {
    return false;
  }
  return !/(?:<\s*(?:script|foreignObject|iframe|object|embed)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:)/i.test(
    decoded,
  );
}

export function fileName(file: FileItem): string {
  if (file.name) return file.name;
  if (file.originFile?.name) return file.originFile.name;
  if (!file.url || /^\s*data:/i.test(file.url)) return 'File';
  const name = file.url?.split(/[?#]/)[0]?.split('/').pop();
  if (!name) return 'File';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

export function fileExtension(file: FileItem): string {
  const name = fileName(file);
  const dot = name.lastIndexOf('.');
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : '';
}

export function fileKind(file: FileItem): FileKind {
  const type = (file.type ?? file.originFile?.type ?? '').toLowerCase();
  const extension = fileExtension(file);
  if (
    /^image\/(png|jpe?g|webp|gif|avif|bmp|svg\+xml|x-icon)$/.test(type) ||
    IMAGE_EXTENSIONS.has(extension)
  )
    return 'image';
  if (
    ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(type) ||
    VIDEO_EXTENSIONS.has(extension)
  )
    return 'video';
  if (/^audio\//.test(type) || AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (SHEET_EXTENSIONS.has(extension) || /(?:spreadsheet|excel|text\/csv|tab-separated)/.test(type))
    return 'sheet';
  if (
    ARCHIVE_EXTENSIONS.has(extension) ||
    /(?:zip|compressed|x-tar|gzip|x-7z|x-rar|bzip2)/.test(type)
  )
    return 'archive';
  if (
    CODE_EXTENSIONS.has(extension) ||
    (/(?:json|javascript|typescript|xml|yaml|x-sh)/.test(type) && type !== 'image/svg+xml')
  )
    return 'code';
  if (
    DOCUMENT_EXTENSIONS.has(extension) ||
    /(?:application\/pdf|msword|wordprocessingml|presentationml|powerpoint|opendocument\.text|rtf|^text\/)/.test(
      type,
    )
  )
    return 'document';
  return 'file';
}

export function safeFileUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed || /^(?:javascript|vbscript):/i.test(trimmed)) return undefined;
  if (/^data:/i.test(trimmed)) {
    if (!SAFE_DATA_MIME.test(trimmed)) return undefined;
    if (/^data:image\/svg\+xml/i.test(trimmed) && !isSafeSvgDataUrl(trimmed)) return undefined;
  }
  return url;
}

export function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = size ? Math.max(0, Math.min(4, Math.floor(Math.log(size) / Math.log(1024)))) : 0;
  return `${Number((size / 1024 ** index).toFixed(index ? 1 : 0))} ${units[Math.max(0, index)]}`;
}
