import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConfigProvider,
  FileList,
  Upload,
  type UploadFile,
  type UploadRequest,
  type UploadResult,
} from '../index';
import { acceptsFile, uploadRequest } from './request';

const createUrl = vi.fn(() => 'blob:preview');
const revokeUrl = vi.fn();
beforeEach(() => {
  vi.stubGlobal(
    'URL',
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl }),
  );
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
const textFile = (name = 'notes.txt') => new File(['hello'], name, { type: 'text/plain' });
describe('Upload and FileList', () => {
  it('handles URL-only files, zero bytes and media-only preview actions', () => {
    render(
      <ConfigProvider locale="en-US">
        <FileList
          items={[
            { url: '/files/project%20notes.pdf?download=1' },
            { url: '/empty.txt', size: 0 },
            { url: '/picture.jpg' },
            { url: 'javascript:alert(1)', name: 'unsafe.png' },
          ]}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('project notes.pdf')).toBeInTheDocument();
    expect(screen.getByText('0 B')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Preview/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Preview picture.jpg' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Download/ })).toHaveLength(3);
  });
  it('uses the same count, size and type validation for selected and dropped files', async () => {
    const reject = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <Upload accept=".txt" multiple maxSize={6} maxCount={2} onReject={reject} />
      </ConfigProvider>,
    );
    const choose = container.querySelector('input[type=file]') as HTMLInputElement;
    await userEvent.upload(choose, [
      textFile('one.txt'),
      new File(['12345678'], 'large.txt', { type: 'text/plain' }),
    ]);
    await screen.findByText('one.txt');
    expect(reject.mock.lastCall?.[0][0].reason).toBe('size');
    fireEvent.drop(container.querySelector('.leaf-upload') as Element, {
      dataTransfer: {
        files: [
          textFile('two.txt'),
          textFile('third.txt'),
          new File(['a'], 'image.png', { type: 'image/png' }),
        ],
      },
    });
    await screen.findByText('two.txt');
    expect(container.querySelectorAll('.leaf-file-list__item')).toHaveLength(2);
    expect(reject.mock.lastCall?.[0].map((entry: { reason: string }) => entry.reason)).toEqual([
      'count',
      'type',
    ]);
  });
  it('follows media URL changes by uid and closes preview when its file is removed', async () => {
    const view = (url?: string) => (
      <ConfigProvider locale="en-US">
        <FileList items={url ? [{ uid: 'video', name: 'demo.mp4', url }] : []} />
      </ConfigProvider>
    );
    const { rerender } = render(view('/first.mp4'));
    await userEvent.click(screen.getByRole('button', { name: 'Preview demo.mp4' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('video')).toHaveAttribute('src', '/first.mp4');
    rerender(view('/updated.mp4'));
    expect(dialog.querySelector('video')).toHaveAttribute('src', '/updated.mp4');
    rerender(view());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it('awaits validation, cancels an active upload, retries, and ignores a late cancelled result', async () => {
    const requests: { request: UploadRequest; resolve: (result: UploadResult) => void }[] = [];
    const custom = vi.fn(
      (request: UploadRequest) =>
        new Promise<UploadResult>((resolve) => requests.push({ request, resolve })),
    );
    const changes = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <Upload customRequest={custom} beforeUpload={async () => true} onChange={changes} />
      </ConfigProvider>,
    );
    await userEvent.upload(
      container.querySelector('input[type=file]') as HTMLInputElement,
      textFile(),
    );
    await waitFor(() => expect(custom).toHaveBeenCalledOnce());
    act(() => requests[0]?.request.onProgress(42));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel upload notes.txt' }));
    expect(requests[0]?.request.signal.aborted).toBe(true);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry upload notes.txt' }));
    await waitFor(() => expect(custom).toHaveBeenCalledTimes(2));
    await act(async () => requests[0]?.resolve({ url: '/stale.txt' }));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await act(async () => requests[1]?.resolve({ url: '/uploaded.txt' }));
    expect(screen.getByRole('link', { name: 'Download notes.txt' })).toHaveAttribute(
      'href',
      '/uploaded.txt',
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(changes.mock.lastCall?.[1].reason).toBe('success');
  });
  it('supports controlled lists, denied removal, and clears resources on unmount in StrictMode', async () => {
    let signal: AbortSignal | undefined;
    const custom = vi.fn((request: UploadRequest) => {
      signal = request.signal;
      return new Promise<void>(() => {});
    });
    function Example() {
      const [files, setFiles] = useState<UploadFile[]>([]);
      return (
        <Upload
          multiple
          fileList={files}
          onChange={setFiles}
          customRequest={custom}
          onRemove={() => false}
        />
      );
    }
    const { container, unmount } = render(
      <StrictMode>
        <ConfigProvider locale="en-US">
          <Example />
        </ConfigProvider>
      </StrictMode>,
    );
    await userEvent.upload(
      container.querySelector('input[type=file]') as HTMLInputElement,
      new File(['photo'], 'photo.png', { type: 'image/png' }),
    );
    await waitFor(() => expect(custom).toHaveBeenCalledOnce());
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo.png' }));
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
    expect(revokeUrl).toHaveBeenCalledWith('blob:preview');
  });
  it('does not launch requests for a disabled dropzone and validates MIME wildcards without a browser MIME', () => {
    const custom = vi.fn();
    const { container } = render(<Upload disabled drag customRequest={custom} />);
    fireEvent.drop(container.querySelector('.leaf-upload') as Element, {
      dataTransfer: { files: [textFile()] },
    });
    expect(custom).not.toHaveBeenCalled();
    expect(acceptsFile(new File(['a'], 'PHOTO.PNG'), 'image/*')).toBe(true);
    expect(acceptsFile(textFile(), 'image/*,.pdf')).toBe(false);
  });
  it('sends FormData and progress with XHR, rejects failures and aborts with the signal', async () => {
    let xhr: RequestMock | undefined;
    class RequestMock {
      status = 201;
      responseText = '{"url":"/files/notes.txt"}';
      withCredentials = false;
      upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onabort: (() => void) | null = null;
      body: FormData | File | null = null;
      open = vi.fn();
      setRequestHeader = vi.fn();
      send(body: FormData | File) {
        this.body = body;
        xhr = this;
      }
      abort() {
        this.onabort?.();
      }
    }
    vi.stubGlobal('XMLHttpRequest', RequestMock);
    const request = new AbortController();
    const progress = vi.fn();
    const task = uploadRequest({
      file: textFile(),
      signal: request.signal,
      onProgress: progress,
      action: '/upload',
      method: 'POST',
      fieldName: 'attachment',
      withCredentials: false,
      data: { folder: 'docs' },
    });
    expect((xhr?.body as FormData | undefined)?.get('folder')).toBe('docs');
    expect((xhr?.body as FormData | undefined)?.get('attachment')).toBeInstanceOf(File);
    xhr?.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent);
    expect(progress).toHaveBeenCalledWith(50);
    xhr?.onload?.();
    expect(await task).toMatchObject({ url: '/files/notes.txt' });
    const failed = uploadRequest({
      file: textFile(),
      signal: request.signal,
      onProgress: progress,
      action: '/upload',
      method: 'PUT',
      fieldName: 'file',
      withCredentials: false,
    });
    if (xhr) xhr.status = 500;
    xhr?.onload?.();
    await expect(failed).rejects.toThrow('500');
    const cancelled = uploadRequest({
      file: textFile(),
      signal: request.signal,
      onProgress: progress,
      action: '/upload',
      method: 'POST',
      fieldName: 'file',
      withCredentials: false,
    });
    request.abort();
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });
  });
});
