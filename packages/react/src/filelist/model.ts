import type { FileItem } from './filelist';
export function fileName(file: FileItem): string {
  if (file.name) return file.name;
  if (file.originFile?.name) return file.originFile.name;
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
  return name.includes('.') ? (name.split('.').pop()?.toLowerCase() ?? '') : '';
}
export function fileKind(
  file: FileItem,
): 'image' | 'video' | 'audio' | 'document' | 'sheet' | 'archive' | 'code' | 'file' {
  const type = file.type ?? file.originFile?.type ?? '';
  const extension = fileExtension(file);
  if (
    /^image\/(png|jpeg|webp|gif|avif|bmp|svg\+xml)$/.test(type) ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'bmp', 'svg'].includes(extension)
  )
    return 'image';
  if (
    ['video/mp4', 'video/webm', 'video/ogg'].includes(type) ||
    ['mp4', 'webm', 'ogv', 'mov'].includes(extension)
  )
    return 'video';
  if (/^audio\//.test(type) || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension))
    return 'audio';
  if (['pdf', 'doc', 'docx', 'rtf', 'txt', 'md', 'odt', 'ppt', 'pptx'].includes(extension))
    return 'document';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) return 'sheet';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
  if (
    [
      'js',
      'jsx',
      'ts',
      'tsx',
      'json',
      'html',
      'css',
      'scss',
      'xml',
      'yml',
      'yaml',
      'py',
      'java',
      'go',
    ].includes(extension)
  )
    return 'code';
  return 'file';
}
export function safeFileUrl(url?: string): string | undefined {
  if (!url || /^\s*(?:javascript|vbscript|data):/i.test(url)) return undefined;
  return url;
}
export function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = size ? Math.max(0, Math.min(4, Math.floor(Math.log(size) / Math.log(1024)))) : 0;
  return `${Number((size / 1024 ** index).toFixed(index ? 1 : 0))} ${units[Math.max(0, index)]}`;
}
