import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider, QRCode } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('QRCode', () => {
  it('renders SVG and guards logoSize relative to small size', () => {
    const { container, rerender } = render(
      <ConfigProvider locale="en-US">
        <QRCode value="https://example.com" size={64} logo="/logo.png" logoSize={48} />
      </ConfigProvider>,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '64');
    const clampedWidth = svg?.querySelector('image')?.getAttribute('width');
    const clampedHeight = svg?.querySelector('image')?.getAttribute('height');
    expect(clampedWidth).toBe(clampedHeight);

    rerender(
      <ConfigProvider locale="en-US">
        <QRCode value="https://example.com" size={64} logo="/logo.png" logoSize={19} />
      </ConfigProvider>,
    );
    expect(container.querySelector('svg image')?.getAttribute('width')).toBe(clampedWidth);
  });

  it('shows expired notice, hides underlying SVG from AT, and disables download when inactive', async () => {
    const refresh = vi.fn();
    const { container, rerender } = render(
      <ConfigProvider locale="en-US">
        <QRCode value="https://example.com" status="expired" downloadable onRefresh={refresh} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('QR code expired');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Refresh code' }));
    expect(refresh).toHaveBeenCalledOnce();

    rerender(
      <ConfigProvider locale="en-US">
        <QRCode value="https://example.com" status="loading" downloadable />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  });

  it('serializes SVG with computed fill styles and triggers download when active', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:qr-test');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <ConfigProvider locale="en-US">
        <QRCode value="https://example.com" downloadable fileName="invite.svg" />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toThrow();
  });
});
