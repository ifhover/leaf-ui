import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { type FileItem, FileList, type FileListProps } from './filelist';

const view = (items: readonly FileItem[], props: Partial<FileListProps> = {}) => (
  <StrictMode>
    <ConfigProvider locale="en-US">
      <FileList items={items} {...props} />
    </ConfigProvider>
  </StrictMode>
);

describe('FileList', () => {
  it('falls back for failed thumbnails and retries when the same file gets a new URL', () => {
    const file = { uid: 'photo', url: '/missing.png' };
    const { container, rerender } = render(view([file], { listType: 'picture' }));
    const thumbnail = container.querySelector('img');
    expect(thumbnail).toHaveAttribute('src', '/missing.png');
    fireEvent.error(thumbnail as HTMLImageElement);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.leaf-file-list__icon svg')).not.toBeNull();
    rerender(view([{ ...file, url: '/available.png' }], { listType: 'picture' }));
    expect(container.querySelector('img')).toHaveAttribute('src', '/available.png');
    rerender(view([{ ...file, url: '/available.png' }]));
    expect(container.querySelector('img')).toBeNull();
  });

  it('waits for removal, prevents duplicate requests, and lets the affected row retry after rejection', async () => {
    let reject: (reason: Error) => void = () => {};
    const onRemove = vi.fn(
      () =>
        new Promise<boolean>((_, fail) => {
          reject = fail;
        }),
    );
    const files = [
      { uid: 'one', name: 'one.pdf' },
      { uid: 'two', name: 'two.pdf' },
    ];
    render(view(files, { removable: true, onRemove }));
    const remove = screen.getByRole('button', { name: 'Remove one.pdf' });
    fireEvent.click(remove);
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(remove).toBeDisabled();
    expect(remove.closest('li')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Remove two.pdf' })).toBeEnabled();
    await act(async () => reject(new Error('Please try again.')));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Please try again.');
    expect(alert.closest('li')).toHaveTextContent('one.pdf');
    expect(
      within(screen.getAllByRole('listitem')[1] as HTMLElement).queryByRole('alert'),
    ).toBeNull();
    expect(remove).toBeEnabled();
    onRemove.mockImplementationOnce(async () => false);
    await userEvent.click(remove);
    await waitFor(() => expect(remove).toBeEnabled());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('one.pdf')).toBeInTheDocument();
  });

  it('keeps a file row and its feedback when the preceding file is removed', async () => {
    const files = [{ url: '/first.pdf' }, { url: '/second.pdf' }];
    const props = {
      removable: true,
      onRemove: async () => {
        throw new Error('Not removed.');
      },
    };
    const { rerender } = render(view(files, props));
    await userEvent.click(screen.getByRole('button', { name: 'Remove second.pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Not removed.');
    const row = screen.getByText('second.pdf').closest('li');
    rerender(view(files.slice(1), props));
    expect(screen.getByText('second.pdf').closest('li')).toBe(row);
    expect(screen.getByRole('alert')).toHaveTextContent('Not removed.');
  });

  it('disables built-in actions and honors custom action rendering and callbacks', async () => {
    const files = [{ uid: 'photo', name: 'photo.png', url: '/photo.png' }];
    const onPreview = vi.fn(),
      onDownload = vi.fn(),
      onRemove = vi.fn();
    const { rerender } = render(
      view(files, { disabled: true, removable: true, onPreview, onRemove }),
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    const download = screen.getByRole('link', { name: 'Download photo.png' });
    expect(download).toHaveAttribute('aria-disabled', 'true');
    expect(download).not.toHaveAttribute('href');
    await userEvent.click(screen.getByRole('button', { name: 'Preview photo.png' }));
    expect(onPreview).not.toHaveBeenCalled();
    rerender(view(files, { onPreview, onDownload }));
    await userEvent.click(screen.getByRole('button', { name: 'Preview photo.png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Download photo.png' }));
    expect(onPreview).toHaveBeenCalledWith(files[0]);
    expect(onDownload).toHaveBeenCalledWith(files[0]);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(view(files, { renderActions: () => null }));
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('exposes a bounded progress value and displays upload errors beside their file', () => {
    const files = [
      { uid: 'upload', name: 'video.mp4', status: 'uploading' as const, percent: -20 },
      {
        uid: 'error',
        name: 'archive.zip',
        status: 'error' as const,
        error: 'Connection interrupted.',
      },
    ];
    const { rerender } = render(view(files));
    expect(screen.getByRole('progressbar', { name: 'Upload progress video.mp4' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByText('Connection interrupted.').closest('li')).toHaveTextContent(
      'archive.zip',
    );
    for (const [percent, value] of [
      [120, '100'],
      [Number.NaN, '0'],
      [42.4, '42'],
    ] as const) {
      rerender(view([{ ...files[0], percent }]));
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', value);
    }
  });
});
