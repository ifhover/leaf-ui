import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '../button';
import { Input } from '../input';
import { Loading } from '../loading';
import { Result } from '../result';
import { useText } from '../shared/use-text';

// Imported only inside the client-side lazy viewer. Applications can self-host this worker.
const defaultWorker = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
export function PdfViewer({
  url,
  workerSrc = defaultWorker,
  onError,
}: {
  url: string;
  workerSrc?: string;
  onError?: (error: Error) => void;
}) {
  const t = useText();
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [password, setPassword] = useState('');
  const [request, setRequest] = useState<{
    submit: (password: string) => void;
    wrong: boolean;
  } | null>(null);
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset pagination and password requests for a different file.
  useEffect(() => {
    setPage(1);
    setPages(0);
    setPassword('');
    setRequest(null);
  }, [url]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const sync = () => setWidth(Math.max(100, node.clientWidth - 32));
    sync();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    observer?.observe(node);
    return () => observer?.disconnect();
  }, []);
  return (
    <div className="leaf-file-preview__pdf" ref={root}>
      <div className="leaf-file-preview__toolbar">
        <Button
          variant="ghost"
          size="sm"
          startIcon={<ChevronLeft size={16} />}
          aria-label={t('上一页', 'Previous page')}
          disabled={page <= 1}
          onClick={() => setPage((value) => value - 1)}
        />
        <span>
          {page} / {pages || '—'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<ChevronRight size={16} />}
          aria-label={t('下一页', 'Next page')}
          disabled={!pages || page >= pages}
          onClick={() => setPage((value) => value + 1)}
        />
        <Button
          variant="ghost"
          size="sm"
          startIcon={<Minus size={16} />}
          aria-label={t('缩小', 'Zoom out')}
          disabled={zoom <= 0.5}
          onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
        />
        <span>{Math.round(zoom * 100)}%</span>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<Plus size={16} />}
          aria-label={t('放大', 'Zoom in')}
          disabled={zoom >= 3}
          onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
        />
      </div>
      {request && (
        <form
          className="leaf-file-preview__password"
          onSubmit={(event) => {
            event.preventDefault();
            request.submit(password);
            setRequest(null);
          }}
        >
          <Input
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('输入 PDF 密码', 'Enter PDF password')}
            aria-label={t('PDF 密码', 'PDF password')}
            status={request.wrong ? 'error' : undefined}
          />
          <Button type="submit">{t('打开', 'Open')}</Button>
        </form>
      )}
      <div className="leaf-file-preview__pdf-page">
        <Document
          file={url}
          loading={<Loading />}
          error={<Result status="error" title={t('PDF 加载失败', 'PDF could not be loaded')} />}
          onPassword={(submit, reason) => setRequest({ submit, wrong: reason === 2 })}
          onLoadSuccess={(document) => {
            setPages(document.numPages);
            setPage((value) => Math.min(value, document.numPages));
          }}
          onLoadError={onError}
          externalLinkTarget="_blank"
          externalLinkRel="noopener noreferrer"
        >
          <Page
            pageNumber={page}
            width={Math.min(width, 1000) * zoom}
            loading={<Loading />}
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>
      </div>
    </div>
  );
}
