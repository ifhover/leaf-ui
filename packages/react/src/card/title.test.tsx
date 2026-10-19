import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Card, CardTitle, ConfigProvider } from '../index';
import { CardTitle as SubpathCardTitle } from './index';

describe('CardTitle', () => {
  it('supports standalone heading semantics, native attributes, events and refs', async () => {
    const ref = createRef<HTMLHeadingElement>();
    const click = vi.fn();
    const { rerender } = render(
      <CardTitle
        ref={ref}
        level={2}
        size="sm"
        id="section-title"
        title="Section heading"
        className="custom-title"
        aria-describedby="section-description"
        onClick={click}
      >
        Project <span>details</span>
      </CardTitle>,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Project details' });
    expect(SubpathCardTitle).toBe(CardTitle);
    expect(ref.current).toBe(heading);
    expect(heading).toHaveClass('leaf-card-title--sm', 'custom-title');
    expect(heading).toHaveAttribute('id', 'section-title');
    expect(heading).toHaveAttribute('title', 'Section heading');
    expect(heading).toHaveAttribute('aria-describedby', 'section-description');
    expect(heading.closest('.leaf-card')).toBeNull();
    await userEvent.click(heading);
    expect(click).toHaveBeenCalledOnce();
    rerender(<CardTitle ref={ref}>Updated title</CardTitle>);
    expect(ref.current).toBe(screen.getByRole('heading', { level: 3, name: 'Updated title' }));
    expect(ref.current).toHaveClass('leaf-card-title--md');
  });

  it('applies standalone defaults and instance overrides while Card owns its embedded title', () => {
    render(
      <ConfigProvider
        components={{ CardTitle: { size: 'lg', level: 2, className: 'standalone-default' } }}
      >
        <CardTitle>Standalone</CardTitle>
        <CardTitle size="sm" level={4} className="instance-title">
          Instance
        </CardTitle>
        <ConfigProvider components={{ CardTitle: null }}>
          <CardTitle>Reset</CardTitle>
        </ConfigProvider>
        <Card size="sm" title="Embedded">
          <CardTitle>Slotted</CardTitle>
        </Card>
      </ConfigProvider>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Standalone' })).toHaveClass(
      'leaf-card-title--lg',
      'standalone-default',
    );
    const instance = screen.getByRole('heading', { level: 4, name: 'Instance' });
    expect(instance).toHaveClass('leaf-card-title--sm', 'instance-title');
    expect(instance).not.toHaveClass('standalone-default');
    const reset = screen.getByRole('heading', { level: 3, name: 'Reset' });
    expect(reset).toHaveClass('leaf-card-title--md');
    expect(reset).not.toHaveClass('standalone-default');
    const embedded = screen.getByRole('heading', { level: 3, name: 'Embedded' });
    expect(embedded).toHaveClass('leaf-card__title', 'leaf-card-title--sm');
    expect(embedded).not.toHaveClass('standalone-default');
    expect(screen.getByRole('heading', { level: 2, name: 'Slotted' })).toHaveClass(
      'leaf-card-title--lg',
      'standalone-default',
    );
  });
});
