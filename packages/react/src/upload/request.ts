export interface UploadResult {
  url?: string;
  name?: string;
  response?: unknown;
}
export interface UploadRequest {
  file: File;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
}
export interface UploadTransport extends UploadRequest {
  action: string;
  method: 'POST' | 'PUT';
  headers?: Readonly<Record<string, string>>;
  data?: Readonly<Record<string, string | Blob>>;
  withCredentials: boolean;
  fieldName: string;
}
export function uploadRequest({
  file,
  signal,
  onProgress,
  action,
  method,
  headers,
  data,
  withCredentials,
  fieldName,
}: UploadTransport): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Upload cancelled', 'AbortError'));
      return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = () => signal.removeEventListener('abort', abort);
    signal.addEventListener('abort', abort, { once: true });
    xhr.open(method, action, true);
    xhr.withCredentials = withCredentials;
    for (const [key, value] of Object.entries(headers ?? {})) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, (event.loaded / event.total) * 100));
    };
    xhr.onerror = () => {
      finish();
      reject(new Error('Network error'));
    };
    xhr.onabort = () => {
      finish();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    xhr.onload = () => {
      finish();
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Upload failed (${xhr.status})`));
        return;
      }
      let response: unknown = xhr.responseText;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        /* Text responses are valid. */
      }
      const object =
        response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
      resolve({
        response,
        url: typeof object.url === 'string' ? object.url : undefined,
        name: typeof object.name === 'string' ? object.name : undefined,
      });
    };
    if (method === 'PUT') xhr.send(file);
    else {
      const body = new FormData();
      for (const [key, value] of Object.entries(data ?? {})) body.append(key, value);
      body.append(fieldName, file);
      xhr.send(body);
    }
  });
}
export function acceptsFile(file: File, accept?: string): boolean {
  if (!accept?.trim()) return true;
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : '';
  const fallback: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.txt': 'text/plain',
  };
  const type = (file.type || fallback[extension] || '').toLowerCase();
  return accept.split(',').some((value) => {
    const entry = value.trim().toLowerCase();
    if (entry.startsWith('.')) return entry === extension;
    if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1));
    return Boolean(entry) && type === entry;
  });
}
