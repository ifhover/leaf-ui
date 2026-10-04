import { useEffect, useRef, useState } from 'react';
import { Loading } from '../loading';
import { Result } from '../result';
import { useText } from '../shared/use-text';
export function TextViewer({
  url,
  maxBytes,
  name,
  onError,
}: {
  url: string;
  maxBytes: number;
  name: string;
  onError?: (error: Error) => void;
}) {
  const t = useText();
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const latest = useRef(onError);
  latest.current = onError;
  useEffect(() => {
    const request = new AbortController();
    setText(null);
    setFailed(false);
    setTruncated(false);
    const read = async () => {
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error(`File request failed (${response.status}).`);
      const reader = response.body?.getReader();
      const limit = Math.max(1, maxBytes);
      let content = '';
      if (reader) {
        let bytes = 0;
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const available = Math.max(0, limit - bytes);
            const slice = value.subarray(0, available);
            content += decoder.decode(slice, { stream: true });
            bytes += value.byteLength;
            if (bytes > limit) {
              setTruncated(true);
              await reader.cancel();
              break;
            }
          }
          content += decoder.decode();
        } finally {
          reader.releaseLock();
        }
      } else {
        const blob = await response.blob();
        if (blob.size > limit) setTruncated(true);
        content = await blob.slice(0, limit).text();
      }
      if (!request.signal.aborted) {
        if (name.toLowerCase().endsWith('.json')) {
          try {
            content = JSON.stringify(JSON.parse(content), null, 2);
          } catch {}
        }
        setText(content);
      }
    };
    read().catch((reason) => {
      if (!request.signal.aborted) {
        setFailed(true);
        latest.current?.(reason instanceof Error ? reason : new Error(String(reason)));
      }
    });
    return () => request.abort();
  }, [url, maxBytes, name]);
  if (failed)
    return <Result status="error" title={t('文件加载失败', 'File could not be loaded')} />;
  if (text === null) return <Loading />;
  return (
    <div className="leaf-file-preview__text">
      {truncated && (
        <p role="status">
          {t(
            '仅展示文件前一部分，下载可查看全部。',
            'Only the beginning is displayed. Download the complete file to read more.',
          )}
        </p>
      )}
      <pre>{text}</pre>
    </div>
  );
}
