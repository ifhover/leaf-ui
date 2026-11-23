import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider, Layout } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Layout', () => {
  it('renders semantic regions and toggles sider with icon trigger and zero-width support', async () => {
    const onCollapse = vi.fn();
    const { container, rerender } = render(
      <ConfigProvider locale="en-US">
        <Layout direction="horizontal">
          <Layout.Header>Header</Layout.Header>
          <Layout.Sider collapsible collapsedWidth={0} onCollapse={onCollapse}>
            Menu
          </Layout.Sider>
          <Layout.Content>Body</Layout.Content>
          <Layout.Footer>Footer</Layout.Footer>
        </Layout>
      </ConfigProvider>,
    );
    expect(container.querySelector('header.leaf-layout__header')).toHaveTextContent('Header');
    expect(container.querySelector('main.leaf-layout__content')).toHaveTextContent('Body');
    expect(container.querySelector('footer.leaf-layout__footer')).toHaveTextContent('Footer');

    const sider = container.querySelector('aside.leaf-layout__sider');
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(toggle.querySelector('svg')).toBeInTheDocument();
    expect(sider).not.toHaveClass('leaf-layout__sider--zero');

    await userEvent.click(toggle);
    expect(onCollapse).toHaveBeenCalledWith(true);
    expect(sider).toHaveClass('leaf-layout__sider--zero');
    expect(sider).toHaveStyle({ width: '0px' });

    rerender(
      <ConfigProvider locale="en-US" direction="rtl">
        <Layout>
          <Layout.Sider collapsible trigger="Fold">
            Menu
          </Layout.Sider>
        </Layout>
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveTextContent('Fold');
  });

  it('auto-collapses on narrow breakpoints and hides manual toggle', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { container } = render(
      <ConfigProvider locale="en-US">
        <Layout.Sider collapsible breakpoint={768}>
          Sidebar
        </Layout.Sider>
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-layout__sider')).toHaveAttribute(
      'data-collapsed',
      'true',
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
