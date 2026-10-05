import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { cropImage } from './crop';
import { CropEditor } from './editor';

vi.mock('./crop', () => ({ cropImage: vi.fn() }));
afterEach(() => vi.resetAllMocks());

describe('ImageCropper export recovery', () => {
  it('exports natural image coordinates and permits another export after a CORS failure', async () => {
    const onExport = vi.fn();
    const onError = vi.fn();
    const result = { blob: new Blob(['image']), width: 768, height: 512 };
    vi.mocked(cropImage)
      .mockRejectedValueOnce(new Error('Tainted canvas'))
      .mockResolvedValueOnce(result);
    render(
      <ConfigProvider locale="en-US">
        <CropEditor src="/photo.png" onExport={onExport} onError={onError} />
      </ConfigProvider>,
    );
    const image = screen.getByRole('img', { name: 'Image to crop' });
    Object.defineProperties(image, {
      naturalWidth: { value: 960 },
      naturalHeight: { value: 640 },
    });
    fireEvent.load(image);
    await userEvent.click(screen.getByRole('button', { name: 'Crop' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Export failed');
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Crop' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Crop' }));
    await waitFor(() => expect(onExport).toHaveBeenCalledWith(result));
    expect(cropImage).toHaveBeenLastCalledWith(
      '/photo.png',
      { x: 96, y: 64, width: 768, height: 512 },
      'rect',
      'image/png',
      0.92,
      'anonymous',
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
